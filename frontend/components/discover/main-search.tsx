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
				className={`py-2 ${compact ? "w-70" : "w-full max-w-2xl mx-auto"} flex flex-col items-center gap-2`}
				onSubmit={form.handleSubmit(onSubmit)}
			>
				<FieldGroup>
					<Controller
						name="query"
						control={form.control}
						render={({ field, fieldState: { invalid } }) => (
							<Field data-invalid={invalid}>
								<InputGroup className={compact ? undefined : "h-12 rounded-md"}>
									{togglesVisible && (
										<InputGroupAddon align="inline-start" className="border-r">
											<SearchModeContainer />
										</InputGroupAddon>
									)}
									<InputGroupInput
										{...field}
										id={field.name}
										aria-invalid={invalid}
										placeholder="A hopeful sci-fi adventure about rebellion..."
										autoComplete="off"
									/>
									{showIconSearchInputIcon && (
										<InputGroupAddon
											align="inline-start"
											className={compact ? undefined : "pl-3"}
										>
											{icon}
										</InputGroupAddon>
									)}
									{btnVisible && (
										<InputGroupAddon align="inline-end">
											<Button
												className={`${compact ? "size-7 rounded-lg" : "size-9 rounded-md"} cursor-pointer`}
												type="submit"
												form={formId}
											>
												<ArrowRight />
											</Button>
										</InputGroupAddon>
									)}
								</InputGroup>
								{showRecommendationBadges && (
									<>
										<p className="text-center mt-5 p-1 text-sm tracking-wider text-muted-foreground">
											AI TRENDING MOODS
										</p>
										<RecommendationBadges onClick={handleRecommendationClick} />
									</>
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
