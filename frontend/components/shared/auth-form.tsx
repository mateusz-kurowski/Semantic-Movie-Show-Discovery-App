"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
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
import {
	InputGroup,
	InputGroupAddon,
	InputGroupButton,
	InputGroupInput,
} from "@/components/ui/input-group";
import { authClient } from "@/lib/auth/auth-client";
import Logo from "../layout/shared/logo";

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
	const [formError, setFormError] = useState<string | null>(null);
	const [showPassword, setShowPassword] = useState(false);
	const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

	const form = useForm<AuthFormValues>({
		resolver: zodResolver(authFormSchema),
		defaultValues:
			mode === "sign-up"
				? { mode, email: "", password: "", passwordConfirm: "" }
				: { mode, email: "", password: "" },
	});

	const onSubmit = async ({ email, password, mode }: AuthFormValues) => {
		setFormError(null);
		const fetchOptions = {
			onSuccess: () => {
				router.push("/");
			},
			onError: (ctx: { error: { message: string } }) => {
				setFormError(ctx.error.message);
			},
		};
		if (mode === "sign-up") {
			await authClient.signUp.email({
				email,
				password,
				name: email,
				fetchOptions,
			});
		} else {
			await authClient.signIn.email({
				email,
				password,
				fetchOptions,
			});
		}
	};

	return (
		<div className="flex flex-col items-center gap-6 w-full sm:max-w-md">
			<Link href="/">
				<Logo size="2xl" />
			</Link>
			<Card className="w-full">
				<CardHeader>
					<CardTitle className="text-center text-xl">
						{mode === "sign-in" ? "Welcome back" : "Create your account"}
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
										<InputGroup>
											<InputGroupInput
												{...field}
												id="auth-form-email"
												type="email"
												aria-invalid={fieldState.invalid}
												placeholder="Enter your email"
											/>
										</InputGroup>
										{fieldState.invalid && (
											<FieldError errors={[fieldState.error]} />
										)}
									</Field>
								)}
							/>
							<Controller
								name="password"
								control={form.control}
								render={({ field, fieldState }) => (
									<Field data-invalid={fieldState.invalid}>
										<FieldLabel htmlFor="auth-form-password">
											Password
										</FieldLabel>
										<InputGroup>
											<InputGroupInput
												{...field}
												id="auth-form-password"
												type={showPassword ? "text" : "password"}
												aria-invalid={fieldState.invalid}
												placeholder="Enter your password"
												autoComplete="current-password"
											/>
											<InputGroupAddon align="inline-end">
												<InputGroupButton
													aria-label={
														showPassword ? "Hide password" : "Show password"
													}
													onClick={() => setShowPassword((v) => !v)}
												>
													{showPassword ? <EyeOff /> : <Eye />}
												</InputGroupButton>
											</InputGroupAddon>
										</InputGroup>
										{fieldState.invalid && (
											<FieldError errors={[fieldState.error]} />
										)}
									</Field>
								)}
							/>
							{mode === "sign-up" && (
								<Controller
									name="passwordConfirm"
									control={form.control}
									render={({ field, fieldState }) => (
										<Field data-invalid={fieldState.invalid}>
											<FieldLabel htmlFor="auth-form-password-confirm">
												Confirm Password
											</FieldLabel>
											<InputGroup>
												<InputGroupInput
													{...field}
													id="auth-form-password-confirm"
													type={showPasswordConfirm ? "text" : "password"}
													aria-invalid={fieldState.invalid}
													placeholder="Confirm your password"
													autoComplete="new-password"
												/>
												<InputGroupAddon align="inline-end">
													<InputGroupButton
														aria-label={
															showPasswordConfirm
																? "Hide password"
																: "Show password"
														}
														onClick={() => setShowPasswordConfirm((v) => !v)}
													>
														{showPasswordConfirm ? <EyeOff /> : <Eye />}
													</InputGroupButton>
												</InputGroupAddon>
											</InputGroup>
											{fieldState.invalid && (
												<FieldError errors={[fieldState.error]} />
											)}
										</Field>
									)}
								/>
							)}
							{formError && (
								<div
									role="alert"
									className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2"
								>
									{formError}
								</div>
							)}
						</FieldGroup>
						<Button
							type="submit"
							form="auth-form"
							disabled={form.formState.isSubmitting}
							className="w-full sm:w-auto sm:ml-auto mt-2"
						>
							{form.formState.isSubmitting
								? "Please wait..."
								: mode === "sign-in"
									? "Sign In"
									: "Sign Up"}
						</Button>
					</form>
				</CardContent>
				<CardFooter>
					<Field orientation="horizontal" className="justify-center">
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
		</div>
	);
}
