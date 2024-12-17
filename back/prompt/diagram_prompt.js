const { diagramExample } = require("./diagramExample");

const systemDiagramPrompt = `
**Prompt for LLM:**

You must generate a **DEVS diagram** in a structured JSON format.

---

### Definition of Key Concepts:

1. **Atomic Model**:  
   - It is a basic unit in DEVS.  
   - It has **input ports** ('inputPorts') and **output ports** ('outputPorts').  
   - Each port is identified by an 'id'.  

2. **Coupled Model**:  
   - It is a composite model containing multiple atomic and/or coupled models.  
   - It has **input ports** and **output ports**, but **each port is duplicated** to handle internal and external connections:  
     - **Internal ports** (e.g., 'in-internal' and 'out-internal') connect internal sub-models.  
     - **External ports** (e.g., 'in' and 'out') interact with the outside of the coupled model.  

3. **Connection Between Models**:  
   - Connections (edges) link **output ports** of a source model to **input ports** of a target model.  
   - Example: An output 'out-1' of model 'A' can be connected to the input 'in-1' of model 'B'.  

---

### Expected Structure:

The generated JSON format must contain:  

1. A **list of nodes** ('nodes') representing the models:  
   - Each node must include:  
     - **'id'**: A unique identifier.  
     - **'position'** ('x, y'): The model's location.  
     - **'style'**: Includes size ('width, height').  
     - **'data'** containing:  
       - ''modelType'' (value: ''atomic'' or ''coupled'').  
       - ''label'': The model's name.  
       - ''inputPorts'' and ''outputPorts'', represented as a **simple list** of incrementing numeric identifiers like '1, 2, 3'.  
         - **Important**: You must **not generate** complex port names like 'in-1' or 'out-1'. The system will automatically handle final port naming.  
   - **If the model is contained within another coupled model**, and **only then** (very important):  
     - Add the field **'parentId'** with the id of the parent coupled model.  
     - Add the field **'extent'** with the value ''parent''.  
   - **If the model is not contained within another coupled model**, **do not add** these fields. Never leave 'extent' null or empty; simply omit it.  

2. A **list of edges** ('edges') representing connections between model ports:  
   Each connection must follow a clear structure and include the following fields:  
   - **'id'**: A unique identifier for each connection.  
   - **'source'**: The 'id' of the source model where the connection originates.  
   - **'sourceHandle'**: The 'id' of the source port in the format **'in-x'**, **'out-x'**, **'in-internal-x'**, or **'out-internal-x'**, where 'x' is an incrementing integer corresponding to the port to connect.  
   - **'target'**: The 'id' of the target model where the connection ends.  
   - **'targetHandle'**: The 'id' of the target port in the same format **'in-x'**, **'out-x'**, **'in-internal-x'**, or **'out-internal-x'**.  
   - **'type'**: Must always have the fixed value **'smoothstep'**.  

---

### Specific Important Rules:

1. **Port Format**:  
   - Ports must strictly follow these formats:  
     - **'in-x'**: External input ports.  
     - **'out-x'**: External output ports.  
     - **'in-internal-x'**: Internal input ports for sub-models.  
     - **'out-internal-x'**: Internal output ports for sub-models.  
   - Here, 'x' is an **incrementing integer**, starting at '1'. It corresponds to the port listed in the model as follows: outputPorts: [{ id: '1' }].  

---

### Example Provided Separately:
Refer to the example JSON I will include. Follow this structure precisely for **nodes** and **edges**, while applying the described principles.



` + diagramExample;


module.exports = { systemDiagramPrompt }