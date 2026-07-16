import Link from "next/link";
import HeaderNavElement from "./header--nav-element";

const Nav = () => {
	return (
		<nav className="flex space-x-4">
			<ul className="flex space-x-4">
				<HeaderNavElement href="/">Discover</HeaderNavElement>
				<HeaderNavElement href="/watchlist">Watchlist</HeaderNavElement>
				<HeaderNavElement href="/history">History</HeaderNavElement>
			</ul>
		</nav>
	);
};

export default Nav;
