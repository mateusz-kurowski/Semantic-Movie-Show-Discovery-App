"use client";
import type { PropsWithChildren } from "react";

const layout = ({ children }: PropsWithChildren) => {
	return <main className="flex justify-center items-center">{children}</main>;
};

export default layout;
