import type { ComponentProps } from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ProseLink } from "./prose-link";

// Next's Link renders an <a> too; marking it shows which way a link went.
vi.mock("next/link", () => ({
  default: ({ transitionTypes, ...props }: ComponentProps<"a"> & { transitionTypes?: string[] }) => (
    <a data-next-link={transitionTypes?.join(" ") ?? ""} {...props} />
  ),
}));

const linkTo = (href: string) => {
  render(<ProseLink href={href}>the link</ProseLink>);
  return screen.getByRole("link", { name: "the link" });
};

describe("a link in the writing", () => {
  it("to another of the site's pages opens in the app, sliding forward", () => {
    const link = linkTo("/projects/dresscircle/");
    expect(link).toHaveAttribute("href", "/projects/dresscircle/");
    expect(link).toHaveAttribute("data-next-link", "nav-forward");
  });

  it.each(["https://dresscircle.vercel.app", "mailto:someone@example.com", "#the-race", "/resume.pdf"])(
    "to %s stays a plain link",
    (href) => {
      const link = linkTo(href);
      expect(link).toHaveAttribute("href", href);
      expect(link).not.toHaveAttribute("data-next-link");
    },
  );
});
