import { memo } from 'react';
import { Handle, Position, NodeResizer, NodeToolbar } from '@xyflow/react';
import { NodeData } from '../../../types';
import { Label } from '../../ui/label';
import { Input } from '../../ui/input';
import { Badge } from "../../ui/badge";

type ResizerNodeProps = {
  data: NodeData
}

function ResizerNode({ data, selected }: ResizerNodeProps) {
  let visible = selected ? true : false;
  return (
    <>

      <NodeResizer
        isVisible={visible}
        minWidth={100}
        minHeight={30}
        handleClassName="h-3 w-3 z-50 before:content-[''] before:absolute before:inset-[-20px] before:bg-transparent"
      />

      {/* Toolbar avec le contenu de `data` */}
      <NodeToolbar
      className="h-auto bg-background text-foreground p-4 border border-border rounded shadow flex flex-col"
      isVisible={data.toolbarVisible}
      position={data.toolbarPosition}
    >
      {Object.entries(data).map(([key, value]) => {
        // Ignorer les clés non pertinentes
        if (["toolbarVisible", "toolbarPosition"].includes(key)) return null;

        // Gestion des valeurs complexes
        if (value === null || value === undefined || (Array.isArray(value) && value.length === 0)) {
          return (
            <div key={key} className="mb-4">
              <Label htmlFor={key} className="block text-sm mb-1 capitalize">
                {key.replace(/_/g, " ")}
              </Label>
              <Input id={key} value="N/A" disabled className="w-full" />
            </div>
          );
        }

        // Si c'est un tableau d'objets => Afficher sous forme de liste de tags
        if (Array.isArray(value) && value.every((val) => typeof val === "object")) {
          return (
            <div key={key} className="mb-4">
              <Label htmlFor={key} className="block text-sm mb-1 capitalize">
                {key.replace(/_/g, " ")}
              </Label>
              <div className="flex flex-wrap gap-2">
                {value.map((obj, index) => (
                  <Badge key={index} className="text-xs bg-blue-200 text-blue-800 p-1 rounded">
                    {obj.name || obj.id || `Item ${index + 1}`} {/* Afficher `name`, `id`, ou un fallback */}
                  </Badge>
                ))}
              </div>
            </div>
          );
        }

        // Si c'est un tableau simple (nombres ou chaînes) => Afficher sous forme de liste
        if (Array.isArray(value) && value.every((val) => typeof val === "string" || typeof val === "number")) {
          return (
            <div key={key} className="mb-4">
              <Label htmlFor={key} className="block text-sm mb-1 capitalize">
                {key.replace(/_/g, " ")}
              </Label>
              <Input id={key} value={value.join(", ")} disabled className="w-full" />
            </div>
          );
        }

        // Si c'est un objet non tableau => JSON.stringify formaté
        if (typeof value === "object") {
          return (
            <div key={key} className="mb-4">
              <Label htmlFor={key} className="block text-sm mb-1 capitalize">
                {key.replace(/_/g, " ")}
              </Label>
              <Input id={key} value={JSON.stringify(value, null, 2)} disabled className="w-full" />
            </div>
          );
        }

        // Si c'est une valeur simple => Affichage standard
        return (
          <div key={key} className="mb-4 flex h-5">
            <Label htmlFor={key} className="text-sm mb-1 capitalize w-1/2">
              {key.replace(/_/g, " ")}:
            </Label>
            <Input id={key} value={value} className="w-full text-sm h-full text-right" />
          </div>
        );
      })}
    </NodeToolbar>

      {/* Conteneur principal avec une bordure */}
      < div className='h-full w-full border-border border rounded-lg border-solid '

      >
        {/* En-tête avec le label */}
        < div className={`h-10 ${data.isSelected === true ? "bg-blue-400" : "bg-card-foreground"} border-border rounded-t-lg text-primary-foreground flex justify-evenly items-center`
        }>
          {data.label}
        </div >

        {/* Conteneur principal pour les ports */}
        < div className='flex relative h-4/5 bg-card' >
          {/* Ports d'entrée (aligné à gauche) */}
          < div className='flex flex-col justify-evenly relative -left-2 text-primary '
          >
            {
              data.inputPorts?.map((port: { id: any; }, index: any) => (
                <div key={`in-group-${index}`} className='flex flex-row justify-start'>
                  <Handle
                    className='relative h-5 w-2 secondary-foreground transform-none top-0'
                    type="source"
                    id={`in-${port.id}`}
                    position={Position.Left}
                  />
                  {data.modelType === 'coupled' && (
                    <Handle
                      className='relative h-5 w-2 secondary-foreground transform-none top-0'
                      type="source"
                      id={`in-internal-${port.id}`}
                      position={Position.Right}
                    />
                  )}
                </div>
              ))
            }
          </div >

          {/* Contenu central */}
          < div style={{ flexGrow: 1, textAlign: 'center' }}></div >

          {/* Ports de sortie (aligné à droite) */}
          < div className='flex flex-col justify-evenly  relative text-primary -right-2' >
            {
              data.outputPorts?.map((port: { id: any; }, index: any) => (
                <div key={`out-group-${index}`} className='flex flex-row justify-start'>
                  {data.modelType === 'coupled' && (
                    <Handle
                      className='relative h-5 w-2 secondary-foreground transform-none top-0'
                      type="target"
                      id={`out-internal-${port.id}`}
                      position={Position.Left}
                    />
                  )}
                  <Handle
                    className='relative h-5 w-2 secondary-foreground transform-none top-0'
                    type="source"
                    id={`out-${port.id}`}
                    position={Position.Right}
                  />
                  
                </div>
              ))
            }
          </div >
        </div >
      </div >
    </>
  );
}

export default memo(ResizerNode);
