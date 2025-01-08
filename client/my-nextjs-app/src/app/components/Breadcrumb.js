// src/components/Breadcrumb.js
import Link from "next/link";

export default function Breadcrumb({ links }) {
  return (
    <nav className="text-sm text-gray-600 mb-6">
      <ol className="flex space-x-2">
        {links.map((link, index) => (
          <li key={index} className="flex items-center">
            {link.href ? (
              <Link href={link.href} className="text-blue-500 hover:underline">
                {link.label}
              </Link>
            ) : (
              <span>{link.label}</span>
            )}
            {index < links.length - 1 && <span className="mx-2">/</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}
