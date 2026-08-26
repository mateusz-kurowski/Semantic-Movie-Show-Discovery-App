"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Field,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth/auth-client";

const baseFormSchema = z.object({
	email: z.email("Invalid email address."),
	password: z
		.string()
		.min(6, "Password must be at least 6 characters.")
		.max(100, "Password must be at most 100 characters."),
});

const signInFormSchema = baseFormSchema.extend({
	mode: z.literal("sign-in"),
});

const signUpFormSchema = baseFormSchema
	.extend({
		mode: z.literal("sign-up"),
		passwordConfirm: z.string().min(6).max(100),
	})
	.refine((data) => data.password === data.passwordConfirm, {
		error: "Passwords do not match.",
		path: ["passwordConfirm"],
	});

const authFormSchema = z.discriminatedUnion("mode", [
	signInFormSchema,
	signUpFormSchema,
]);

type AuthFormValues = z.infer<typeof authFormSchema>;

interface AuthFormProps {
	mode: "sign-in" | "sign-up";
}

export function AuthForm({ mode }: AuthFormProps) {
	const router = useRouter();

	const form = useForm<AuthFormValues>({
		resolver: zodResolver(authFormSchema),
		defaultValues:
			mode === "sign-up"
				? { mode, email: "", password: "", passwordConfirm: "" }
				: { mode, email: "", password: "" },
	});

	const onSubmit = async ({ email, password, mode }: AuthFormValues) => {
		const fetchOptions = {
			onSuccess: () => {
				router.push("/");
			},
		};
		if (mode === "sign-up") {
			const result = await authClient.signUp.email({
				email,
				password,
				name: email,
				fetchOptions,
			});
		} else {
			const result = await authClient.signIn.email({
				email,
				password,
				fetchOptions,
			});
		}
	};

	return (
		<Card className="w-full sm:max-w-md">
			<CardHeader>
				<CardTitle className="text-center">
					{mode === "sign-in" ? "Sign In" : "Sign Up"}
				</CardTitle>
			</CardHeader>
			<CardContent>
				<form id="auth-form" onSubmit={form.handleSubmit(onSubmit)}>
					<FieldGroup>
						<Controller
							name="email"
							control={form.control}
							render={({ field, fieldState }) => (
								<Field data-invalid={fieldState.invalid}>
									<FieldLabel htmlFor="auth-form-email">Email</FieldLabel>
									<Input
										{...field}
										id="auth-form-email"
										type="email"
										aria-invalid={fieldState.invalid}
										placeholder="Enter your email"
									/>
									{fieldState.invalid && (
										<FieldError errors={[fieldState.error]} />
									)}
								</Field>
							)}
						/>
						<FieldGroup>
							<Controller
								name="password"
								control={form.control}
								render={({ field, fieldState }) => (
									<Field data-invalid={fieldState.invalid}>
										<FieldLabel htmlFor="auth-form-password">
											Password
										</FieldLabel>
										<Input
											{...field}
											id="auth-form-password"
											type="password"
											aria-invalid={fieldState.invalid}
											placeholder="Enter your password"
										/>
										{fieldState.invalid && (
											<FieldError errors={[fieldState.error]} />
										)}
									</Field>
								)}
							/>
						</FieldGroup>
						{mode === "sign-up" && (
							<FieldGroup>
								<Controller
									name="passwordConfirm"
									control={form.control}
									render={({ field, fieldState }) => (
										<Field data-invalid={fieldState.invalid}>
											<FieldLabel htmlFor="auth-form-password-confirm">
												Confirm Password
											</FieldLabel>
											<Input
												{...field}
												id="auth-form-password-confirm"
												type="password"
												aria-invalid={fieldState.invalid}
												placeholder="Confirm your password"
											/>
											{fieldState.invalid && (
												<FieldError errors={[fieldState.error]} />
											)}
										</Field>
									)}
								/>
							</FieldGroup>
						)}
					</FieldGroup>
					<Button
						type="submit"
						form="auth-form"
						className="w-full sm:w-auto sm:ml-auto"
					>
						Submit
					</Button>
				</form>
			</CardContent>
			<CardFooter>
				<Field orientation="horizontal">
					{mode === "sign-in" ? (
						<p>
							Don't have an account?{" "}
							<Link href="/sign-up" className="text-primary">
								Sign Up
							</Link>
						</p>
					) : (
						<p>
							Already have an account?{" "}
							<Link href="/sign-in" className="text-primary">
								Sign In
							</Link>
						</p>
					)}
				</Field>
			</CardFooter>
		</Card>
	);
}
