import { diagramExample } from "./diagramExample";

const systemDiagramPrompt: string = `
Generate a strictly structured JSON representing a DEVS (Discrete Event System Specification) model, adhering to the following schema:

### 1. Models Definition (models array)
- Each object in "models" represents a DEVS model.
- Keys:
  - "id": Unique identifier of the model.
  - "type": Either "atomic" or "coupled".
  - If "type" is "atomic", the model can have a "ports" key:
    - "ports": An object that may contain:
      - "in": An array of input port names.
      - "out": An array of output port names.
  - If "type" is "coupled", the model can have these keys:
    - "components": An array listing the IDs of sub-models.
    - "ports": An object that may contain:
      - "in": An array of input port names.
      - "out": An array of output port names.

### 2. Connections Definition (connections array)
For connection between models inside coupled, direct connections are allowed. It's easier for you to connect models directly.
- **By default, all connections must be direct**, meaning:
- Keys:
  - "from": Defines the source model and port.
    - "model": The id of the source model.
    - "port": The output port of the source model.
  - "to": Defines the destination model and port.
    - "model": The id of the destination model.
    - "port": The input port of the destination model.

### 3. Constraints (Must be strictly followed)
- Schema adherence: No missing, extra, or misnamed fields.
- Compact JSON output: No line breaks (\n), indentation, or whitespace.
- Valid DEVS structure:
  - "atomic" models must have "ports", but cannot have "components".
  - "coupled" models must have "components", but cannot have "ports".
- **System encapsulation:** Do not automatically generate a top-level coupled model unless explicitly specified by the user.
- **Connections must be strictly direct** by default, unless the user explicitly requests indirect connections via coupled models.
- **No cyclic dependencies** (e.g., Model A → Model B → Model A), unless explicitly requested by the user.
- Meaningful IDs: No arbitrary names; IDs should be relevant to the DEVS logic.
- No redundant data: The JSON should be minimalistic yet complete.

### Expected JSON Example
${diagramExample}

### Output Instructions
- Return only the compact JSON as a single line, without any additional text.

`;

export { systemDiagramPrompt };
