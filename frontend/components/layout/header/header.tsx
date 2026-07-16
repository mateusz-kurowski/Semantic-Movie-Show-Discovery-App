import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar";
import Logo from "../shared/logo";
import Nav from "./nav";

function Header() {
	return (
		<header className=" bg-surface-bright py-3 px-8 flex items-center justify-between">
			<Logo size="4xl" />
			<Nav />
			<Avatar>
				<AvatarImage src="/path/to/avatar.jpg" />
				<AvatarFallback>Profile</AvatarFallback>
			</Avatar>
		</header>
	);
}

export default Header;
