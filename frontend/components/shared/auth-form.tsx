"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
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

	const password = form.watch("password");
	const passwordRules =
		mode === "sign-up"
			? [
					{ label: "At least 6 characters", met: password.length >= 6 },
					{ label: "At most 100 characters", met: password.length <= 100 },
				]
			: [];

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
		<div className="flex w-full flex-col items-center gap-6 sm:max-w-115">
			<Link href="/">
				<Logo size="2xl" />
			</Link>
			<Card className="w-full gap-6 rounded-3xl border border-foreground/10 bg-card/85 p-9 ring-0 shadow-[0_32px_80px_rgba(0,0,0,0.55)] backdrop-blur-3xl [--card-spacing:--spacing(0)]">
				<CardHeader className="gap-2">
					<CardTitle className="text-2xl leading-8 font-bold tracking-[-0.03em] sm:text-[28px]">
						{mode === "sign-in" ? "Welcome back" : "Create your account"}
					</CardTitle>
					<CardDescription className="text-outline">
						{mode === "sign-in"
							? "Your watchlist and history live on your own server."
							: "One account per server. Nothing leaves your machine."}
					</CardDescription>
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
										<InputGroup className="h-12 rounded-xl">
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
										<InputGroup className="h-12 rounded-xl">
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
							{passwordRules.length > 0 && (
								<ul className="-mt-2 flex flex-col gap-1.5">
									{passwordRules.map(({ label, met }) => (
										<li
											key={label}
											className={`flex items-center gap-2 text-[13px] ${met ? "text-on-surface-variant" : "text-outline"}`}
										>
											<span
												className={`flex size-4 shrink-0 items-center justify-center rounded-full ${met ? "bg-secondary/20 text-secondary" : "border border-foreground/20"}`}
											>
												{met && <Check className="size-2.5" />}
											</span>
											{label}
										</li>
									))}
								</ul>
							)}
							{mode === "sign-up" && (
								<Controller
									name="passwordConfirm"
									control={form.control}
									render={({ field, fieldState }) => (
										<Field data-invalid={fieldState.invalid}>
											<FieldLabel htmlFor="auth-form-password-confirm">
												Confirm Password
											</FieldLabel>
											<InputGroup className="h-12 rounded-xl">
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
							className="mt-6 h-12 w-full cursor-pointer rounded-full text-[15px] font-semibold"
						>
							{form.formState.isSubmitting
								? "Please wait..."
								: mode === "sign-in"
									? "Sign In"
									: "Sign Up"}
						</Button>
					</form>
				</CardContent>
				<CardFooter className="mt-6 rounded-none border-0 bg-transparent p-0 text-sm text-on-surface-variant">
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
