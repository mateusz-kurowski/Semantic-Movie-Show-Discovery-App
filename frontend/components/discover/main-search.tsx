"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { Controller, useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "../ui/button";
import { Field, FieldGroup } from "../ui/field";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
} from "../ui/input-group";
import RecommendationBadges from "./recommendation-badges";
import SearchModeContainer from "./search-mode-container";

const searchFormSchema = z.object({
	query: z
		.string()
		.min(1, "Query is required")
		.max(100, "Query must be less than 100 characters"),
});

interface SearchFormProps {
	showRecommendationBadges?: boolean;
	defaultValue?: string;
	togglesVisible?: boolean;
	btnVisible?: boolean;
	icon?: ReactNode;
	showIconWhenNotEmpty?: boolean;
	compact?: boolean;
}

const SearchForm = ({
	showRecommendationBadges,
	defaultValue,
	icon,
	togglesVisible = true,
	btnVisible = true,
	showIconWhenNotEmpty = true,
	compact = false,
}: SearchFormProps) => {
	const router = useRouter();

	const form = useForm<z.infer<typeof searchFormSchema>>({
		resolver: zodResolver(searchFormSchema),
		defaultValues: {
			query: defaultValue || "",
		},
	});
	const showIconSearchInputIcon =
		icon && (showIconWhenNotEmpty ? true : !form.formState.isDirty);

	const onSubmit = ({ query }: z.infer<typeof searchFormSchema>) => {
		router.push(`/search?q=${query}`);
	};

	const handleRecommendationClick = (query: string) => {
		form.setValue("query", query);
		onSubmit({ query });
	};

	const formId = "form-movies-search";
	return (
		<div className={`flex flex-col ${compact ? "" : "w-full"}`}>
			<form
				id={formId}
				className={`${compact ? "w-full max-w-[280px] sm:w-105" : "mx-auto w-full max-w-215"} flex flex-col items-center gap-2`}
				onSubmit={form.handleSubmit(onSubmit)}
			>
				<FieldGroup>
					<Controller
						name="query"
						control={form.control}
						render={({ field, fieldState: { invalid } }) => (
							<Field data-invalid={invalid}>
								<InputGroup
									className={
										compact
											? "h-10 rounded-full border-foreground/12 bg-card px-1.5 has-[input:focus-visible]:ring-3"
											: "h-14 rounded-full border-foreground/12 bg-card px-2.5 shadow-[0_0_0_6px_rgba(208,188,255,0.06),0_24px_60px_rgba(0,0,0,0.5)] sm:h-17"
									}
								>
									{togglesVisible && (
										<InputGroupAddon align="inline-start" className="pr-1">
											<SearchModeContainer query={field.value} />
										</InputGroupAddon>
									)}
									<InputGroupInput
										{...field}
										id={field.name}
										aria-invalid={invalid}
										placeholder="A hopeful sci-fi adventure about rebellion..."
										autoComplete="off"
										className={compact ? undefined : "text-base sm:text-lg"}
									/>
									{showIconSearchInputIcon && (
										<InputGroupAddon
											align="inline-start"
											className={compact ? undefined : "pl-3 text-primary"}
										>
											{icon}
										</InputGroupAddon>
									)}
									{btnVisible && (
										<InputGroupAddon align="inline-end">
											<Button
												className={`${compact ? "size-7" : "size-10 sm:size-12"} cursor-pointer rounded-full`}
												type="submit"
												form={formId}
											>
												<ArrowRight />
											</Button>
										</InputGroupAddon>
									)}
								</InputGroup>
								{showRecommendationBadges && (
									<RecommendationBadges onClick={handleRecommendationClick} />
								)}
							</Field>
						)}
					/>
				</FieldGroup>
			</form>
		</div>
	);
};

export default SearchForm;
