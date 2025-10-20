import Image from "next/image";
import Link from "next/link";
import NavItems from "./NavItems";
import UserDropdown from "./UserDropdown";

const Header = () => {
  return (
    <header className="sticky top-0 header">
      <div className="container header-wrapper">
        <Link href="/" className="flex gap-2">
          <Image
            src="/assets/icons/logo.svg"
            alt="Fluxx logo"
            width={140}
            height={32}
            className="h-9 w-auto cursor-pointer"
          />
          <span className="font-bold font-[700] text-[24px] text-white tracking-[-0.01em]">
            Fluxx
          </span>
        </Link>
        <nav className="hidden sm:block">
          <NavItems />
        </nav>

        <UserDropdown />
      </div>
    </header>
  );
};

export default Header;
