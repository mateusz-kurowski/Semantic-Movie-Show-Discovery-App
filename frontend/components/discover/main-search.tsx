"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
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
}

const SearchForm = ({
	showRecommendationBadges,
	defaultValue,
}: SearchFormProps) => {
	const router = useRouter();

	const form = useForm<z.infer<typeof searchFormSchema>>({
		resolver: zodResolver(searchFormSchema),
		defaultValues: {
			query: defaultValue || "",
		},
	});

	const onSubmit = ({ query }: z.infer<typeof searchFormSchema>) => {
		router.push(`/search?q=${query}`);
	};

	const handleRecommendationClick = (query: string) => {
		form.setValue("query", query);
		onSubmit({ query });
	};

	const formId = "form-movies-search";
	return (
		<form id={formId} className="w-full" onSubmit={form.handleSubmit(onSubmit)}>
			<FieldGroup>
				<Controller
					name="query"
					control={form.control}
					render={({ field, fieldState }) => (
						<Field data-invalid={fieldState.invalid}>
							<InputGroup>
								<InputGroupAddon align="inline-start">
									<SearchModeContainer />
								</InputGroupAddon>
								<InputGroupInput
									{...field}
									id={field.name}
									aria-invalid={fieldState.invalid}
									placeholder="A hopeful sci-fi adventure about rebellion..."
									autoComplete="off"
								/>
								<InputGroupAddon align="inline-end">
									<Button className="text-white" type="submit" form={formId}>
										<ArrowRight />
									</Button>
								</InputGroupAddon>
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
