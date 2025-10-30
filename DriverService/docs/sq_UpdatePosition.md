```mermaid
sequenceDiagram
    actor FE as Front-end
    participant US as Update position service
    participant PE as Driver position
    participant PR as Driver position repository

    FE->>+US: Request update position
    US->>+PR: Get by driver id
    PR-->>-US: Driver position
    US->>US: Check if the driver exists
    US->>+PE: Update driver position
    PE-->>-US:
    US->>+PR: Save driver position
    PR-->>-US:
    US-->>-FE:
```