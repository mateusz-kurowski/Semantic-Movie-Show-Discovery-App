import Link from "next/link";
import React, { PropsWithChildren } from "react";

const HeaderNavElement = (props: PropsWithChildren<{ href: string }>) => {
	return (
		<li className="hover:underline">
			<Link href={props.href} className="text-primary">
				{props.children}
			</Link>
		</li>
	);
};

export default HeaderNavElement;
