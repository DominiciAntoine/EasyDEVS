import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { NodeData } from './types';

type ResizerNodeProps = {
  data: NodeData
}

function ResizerNode({ data }: ResizerNodeProps) {

  return (
    <>
      {/* Conteneur principal avec une bordure */}
      <div className='h-full w-full border-border border rounded-lg border-solid '

      >
        {/* En-tête avec le label */}
        <div className='h-1/5 bg-card-foreground border-border rounded-t-lg text-primary-foreground flex justify-evenly items-center'>
          {data.label}
        </div>

        {/* Conteneur principal pour les ports */}
        <div className='flex relative h-4/5 bg-card'>
          {/* Ports d'entrée (aligné à gauche) */}
          <div className='flex flex-col justify-evenly relative -left-2 text-primary '
          >
            {data.inputPorts?.map((port: { id: any; }, index: any) => (
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
            ))}
          </div>

          {/* Contenu central */}
          <div style={{ flexGrow: 1, textAlign: 'center' }}></div>

          {/* Ports de sortie (aligné à droite) */}
          <div className='flex flex-col justify-evenly  relative text-primary -right-2'>
            {data.outputPorts?.map((port: { id: any; }, index: any) => (
              <div key={`out-group-${index}`} className='flex flex-row justify-start'>
                <Handle
                  className='relative h-5 w-2 secondary-foreground transform-none top-0'
                  type="source"
                  id={`out-${port.id}`}
                  position={data.modelType === "atomic" ? Position.Right : Position.Left}
                />
                {data.modelType === 'coupled' && (
                  <Handle
                    className='relative h-5 w-2 secondary-foreground transform-none top-0'
                    type="target"
                    id={`out-internal-${port.id}`}
                    position={Position.Right}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

export default memo(ResizerNode);
