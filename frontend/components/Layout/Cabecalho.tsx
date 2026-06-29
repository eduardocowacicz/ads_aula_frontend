"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { logout } from "@/app/(auth)/logout/actions";
import styles from "./Layout.module.css";

const LINKS = [
  { href: "/home", label: "Início" },
  { href: "/produtos", label: "Produtos" },
  { href: "/clientes", label: "Clientes" },
  { href: "/orcamentos", label: "Orçamentos" },
  { href: "/usuario", label: "Perfil" },
];

export default function Cabecalho() {
  const pathname = usePathname();

  return (
    <header className={styles.cabecalho}>
      <div className={styles.barra}>
        <Link href="/home" className={styles.marca}>
          <Image src="/logo.svg" alt="Logo" width={30} height={30} />
          <span>SENAC Orçamentos</span>
        </Link>

        <nav className={styles.menu}>
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`${styles.link} ${pathname === link.href ? styles.linkAtivo : ""}`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <form action={logout}>
          <button type="submit" className={styles.btnSair}>
            Sair
          </button>
        </form>
      </div>
    </header>
  );
}
