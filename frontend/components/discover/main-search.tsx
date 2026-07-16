"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight } from "lucide-react";
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

const SearchForm = () => {
	const form = useForm<z.infer<typeof searchFormSchema>>({
		resolver: zodResolver(searchFormSchema),
		defaultValues: {
			query: "",
		},
	});

	const onSubmit = (values: z.infer<typeof searchFormSchema>) => {
		console.log(values);
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
							<RecommendationBadges />
						</Field>
					)}
				/>
			</FieldGroup>
		</form>
	);
};

export default SearchForm;
