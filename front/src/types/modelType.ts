import type { 
  Edge, 
  Node, 
  NodeOrigin, 
  Position, 
  XYPosition, 
  CoordinateExtent, 
} from "@xyflow/react";




export type ReactFlowInput =
{
    nodes: Node<ReactFlowModelData>[]
    edges: Edge[]
}




export type ReactFlowPort = { id: string }

export type ReactFlowModelData = {
  id: string;
  modelType: "atomic" | "coupled"
  label:string;
  inputPorts?: ReactFlowPort[]
  outputPorts?: ReactFlowPort[]
  toolbarVisible: boolean;
  toolbarPosition: Position;
  alwaysShowToolbar?: boolean;
  alwaysShowExtraInfo?: boolean;
}



export type ReactFlowModel<
  NodeData  extends ReactFlowModelData = ReactFlowModelData,
  NodeType extends string = string,
> = {
  // mes propres ajout
  alwaysShowToolbar?: boolean;
  alwaysShowExtraInfo?: boolean;

  id: string;
  position: XYPosition;
  data: NodeData;
  type?: NodeType;
  sourcePosition?: Position;
  targetPosition?: Position;
  hidden?: boolean;
  selected?: boolean;
  dragging?: boolean;
  draggable?: boolean;
  selectable?: boolean;
  connectable?: boolean;
  resizing?: boolean;
  deletable?: boolean;
  dragHandle?: string;
  width?: number | null;
  height?: number | null;
  parentId?: string;
  zIndex?: number;
  extent?: 'parent' | CoordinateExtent;
  expandParent?: boolean;
  ariaLabel?: string;
  focusable?: boolean;
  style?: React.CSSProperties;
  className?: string;
  origin?: NodeOrigin;
  measured?: {
    width?: number;
    height?: number;
  };
};





export type DatabaseConnection = 
{
		from: DatabaseModelLink;
		to: DatabaseModelLink;
}

export type DatabaseModelLink = 
{
  model: string;
  port: string;
}

export type DatabaseModelMetadata = 
{
  backgroundColor?: string
  alwaysShowToolbar?: boolean;
  alwaysShowExtraInfo?: boolean;
  
  toolbarVisible?: boolean;
  toolbarPosition?: Position;
  position?: XYPosition;
  style?: DatabaseModelStyle;
}


export type DatabaseModelStyle = {
  width: number;
  height: number;
};



/*
type Model struct {


	Name            string         `gorm:"type:varchar(255);not null" json:"name"`
	Type            enum.ModelType `gorm:"type:model_type;not null" json:"type"`
	Description     string         `gorm:"type:text;not null" json:"description"`
	Code            string         `gorm:"type:text;not null" json:"code"`
	MetadataJSON    string         `gorm:"type:jsonb;default:'{}'" json:"metadataJson"`
	ComponentsJSON  string         `gorm:"type:jsonb;default:'[]'" json:"componentsJson"`
	ConnectionsJSON string         `gorm:"type:jsonb;default:'[]'" json:"connectionsJson"`
	PortInJSON      string         `gorm:"type:jsonb;default:'[]'" json:"portInJson"`
	PortOutJSON     string         `gorm:"type:jsonb;default:'[]'" json:"portOutJson"`
	CreatedAt       time.Time      `gorm:"type:timestamp;default:now()" json:"createdAt"`
	UpdatedAt       time.Time      `gorm:"type:timestamp;default:now()" json:"updatedAt"`
	DeletedAt       time.Time      `gorm:"index" json:"deletedAt"`
}
*/