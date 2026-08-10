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
		<form
			id={formId}
			className={`${compact ? "py-6 w-70" : "py-2 w-full"}`}
			onSubmit={form.handleSubmit(onSubmit)}
		>
			<FieldGroup>
				<Controller
					name="query"
					control={form.control}
					render={({ field, fieldState: { invalid } }) => (
						<Field data-invalid={invalid}>
							<InputGroup
								className={`py-6 pr-3 rounded-md border-r-2 border-r-slate-200 dark:border-r-slate-700 ${compact ? "rounded-3xl" : ""}`}
							>
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
									<InputGroupAddon align="inline-start">{icon}</InputGroupAddon>
								)}
								{btnVisible && (
									<InputGroupAddon align="inline-end">
										<Button
											className="text-white rounded-sm cursor-pointer"
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
	);
};

export default SearchForm;
