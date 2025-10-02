import Link from "next/link";

export function Footer() {
  const sections = [
    {
      title: "Company",
      links: [
        { name: "About Us", href: "/about" },
        { name: "Careers", href: "/careers" },
        { name: "Blog", href: "/blog" },
        { name: "Press", href: "/press" },
      ],
    },
    {
      title: "Product",
      links: [
        { name: "Features", href: "/features" },
        { name: "Pricing", href: "/pricing" },
        { name: "Integrations", href: "/integrations" },
        { name: "Changelog", href: "/changelog" },
      ],
    },
    {
      title: "Resources",
      links: [
        { name: "Documentation", href: "/docs" },
        { name: "Guides", href: "/guides" },
        { name: "Support", href: "/support" },
        { name: "Community", href: "/community" },
      ],
    },
    {
      title: "Legal",
      links: [
        { name: "Privacy Policy", href: "/privacy" },
        { name: "Terms of Service", href: "/terms" },
        { name: "Cookie Policy", href: "/cookies" },
        { name: "Licenses", href: "/licenses" },
      ],
    },
  ];

  return (
    <>
      <footer className="border-t bg-background py-12 md:py-16">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid gap-12 md:grid-cols-4 items-center justify-center">
            {sections.map((section) => (
              <div key={section.title}>
                <h3 className="mb-6 text-sm font-semibold uppercase tracking-wider text-foreground/80">
                  {section.title}
                </h3>
                <ul className="space-y-3 text-sm">
                  {section.links.map((link) => (
                    <li key={link.name}>
                      <Link
                        href={link.href}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </footer>

      <div className="mt-16 flex items-center justify-center">
        <h2 className="bg-gradient-to-b from-foreground/10 to-transparent bg-clip-text text-center text-6xl font-black leading-tight text-transparent sm:text-7xl md:text-8xl lg:text-9xl">
          Linus Kang Software
        </h2>
      </div>
    </>
  );
}
