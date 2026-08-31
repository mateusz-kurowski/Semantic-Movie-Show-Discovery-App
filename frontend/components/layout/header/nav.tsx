import HeaderNavElement from "./header--nav-element";

const Nav = () => {
	return (
		<nav className="hidden md:flex">
			<ul className="flex gap-7">
				<HeaderNavElement href="/">Discover</HeaderNavElement>
				<HeaderNavElement href="/ask">Ask AI</HeaderNavElement>
				<HeaderNavElement href="/watchlist">Watchlist</HeaderNavElement>
				<HeaderNavElement href="/history">History</HeaderNavElement>
			</ul>
		</nav>
	);
};

export default Nav;
