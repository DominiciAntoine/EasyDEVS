import { components } from "@/api/v1";
import { ReactFlowInput } from "@/types";

export const mockReactFlowModelLibrary: ReactFlowInput = {
    "nodes": [
        {
            "id": "dc80cf72-f4e9-4255-9639-32f07c5831c5",
            "type": "resizer",
            "measured": {
                "height": 339,
                "width": 405
            },
            "data": {
                "id": "dc80cf72-f4e9-4255-9639-32f07c5831c5",
                "modelType": "coupled",
                "label": "Car",
                "inputPorts": [],
                "outputPorts": []
            },
            "dragging": false,
            "selected": false,
            "position": {
                "x": -123.5,
                "y": -94
            },
            "height": 339,
            "width": 405,
            "resizing": false
        },
        {
            "id": "dc80cf72-f4e9-4255-9639-32f07c5831c5/181f9e48-4e6f-4884-bf0b-c6fdb65fa726",
            "type": "resizer",
            "measured": {
                "height": 200,
                "width": 200
            },
            "data": {
                "id": "1519c8a9-2752-4bf1-9228-24b9a52b32cd",
                "modelType": "atomic",
                "label": "tire",
                "inputPorts": [],
                "outputPorts": []
            },
            "dragging": false,
            "selected": false,
            "position": {
                "x": 105.26040649414062,
                "y": 72.5
            },
            "height": 200,
            "width": 200,
            "parentId": "dc80cf72-f4e9-4255-9639-32f07c5831c5",
            "extent": "parent"
        }
    ],
    "edges": []
};

export const mockApiModel: components["schemas"]["request.ModelRequest"][] = [
    {
        "id": "dc80cf72-f4e9-4255-9639-32f07c5831c5",
        "name": "Car",
        "type": "coupled",
        "description": "",
        "code": "",
        "libId": undefined,
        "components": [
            {
                "instanceId": "dc80cf72-f4e9-4255-9639-32f07c5831c5/181f9e48-4e6f-4884-bf0b-c6fdb65fa726",
                "modelId": "1519c8a9-2752-4bf1-9228-24b9a52b32cd",
                "instanceMetadata": {
                    "position": {
                        "x": 105.26040649414062,
                        "y": 72.5
                    },
                    "style": {
                        "width": 200,
                        "height": 200
                    }
                }
            }
        ],
        "ports": [],
        "metadata": {
            "position": {
                "x": -123.5,
                "y": -94
            },
            "style": {
                "width": 405,
                "height": 339
            }
        },
        "connections": []
    },
    {
        "id": "1519c8a9-2752-4bf1-9228-24b9a52b32cd",
        "libId": undefined,
        "name": "tire",
        "type": "atomic",
        "description": "",
        "code": "",
        "components": [],
        "ports": [],
        "metadata": {
            "position": {
                "x": 0,
                "y": 0
            },
            "style": {
                "width": 200,
                "height": 200
            }
        },
        "connections": []
    }
];
