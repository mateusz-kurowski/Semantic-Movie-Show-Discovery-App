import { ArrowRight } from "lucide-react";
import { Button } from "../ui/button";
import { Field } from "../ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "../ui/input-group";
import RecommendationBadges from "./recommendation-badges";
import SearchModeContainer from "./search-mode-container";

const MainSearchComponent = () => {
  return (
    <Field>
      <InputGroup>
        <InputGroupAddon align="inline-start">
          <SearchModeContainer />
        </InputGroupAddon>
        <InputGroupInput placeholder="A hopeful sci-fi adventure about rebellion..." />
        <InputGroupAddon align="inline-end">
          <Button className="text-white">
            <ArrowRight />
          </Button>
        </InputGroupAddon>
      </InputGroup>
      <RecommendationBadges />
    </Field>
  );
};

export default MainSearchComponent;
