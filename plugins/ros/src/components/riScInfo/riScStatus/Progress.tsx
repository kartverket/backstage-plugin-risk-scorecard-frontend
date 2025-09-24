import { RiScStatusEnum, RiScStatusEnumType } from './utils.ts';
import { Box } from '@backstage/ui';

interface RiScStepperProps {
  step: RiScStatusEnumType;
  children?: React.ReactNode;
}

const steps: RiScStatusEnumType[] = [
  RiScStatusEnum.CREATED,
  RiScStatusEnum.DRAFT,
  RiScStatusEnum.WAITING,
  RiScStatusEnum.PUBLISHED,
];

export function ProgressBar({ step }: RiScStepperProps) {
  const circleDiameter = 24;
  const activeStepIndex = steps.indexOf(step);

  const safeStepIndex = activeStepIndex >= 0 ? activeStepIndex : 0;
  const totalSteps = steps.length;

  return (
    <Box
      style={{ position: 'relative', width: '100%', height: circleDiameter }}
    >
      {/* line */}
      <Box
        style={{
          position: 'absolute',
          top: '50%',
          left: circleDiameter / 2,
          right: circleDiameter / 2,
          height: 4,
          backgroundColor: '#e0e0e0',
          transform: 'translateY(-50%)',
          zIndex: 0,
        }}
      />
      {/* Filled line */}
      <Box
        style={{
          position: 'absolute',
          top: '50%',
          left: circleDiameter / 2,
          height: 4,
          width: `calc( (${safeStepIndex} / ${totalSteps - 1}) * (100% - ${circleDiameter}px) )`,
          backgroundColor: '#1F5492',
          transform: 'translateY(-50%)',
          zIndex: 1,
          transition: 'width 0.3s ease-in-out',
        }}
      />
      {/* Circle */}
      <Box
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          position: 'relative',
          zIndex: 2,
        }}
      >
        {steps.map((_, index) => {
          const isActive = index <= safeStepIndex;
          return (
            <Box
              key={index}
              style={{
                width: circleDiameter,
                height: circleDiameter,
                borderRadius: '50%',
                backgroundColor: isActive ? '#1F5492' : '#e0e0e0',
                transition: 'background-color 0.3s ease-in-out',
              }}
            />
          );
        })}
      </Box>
    </Box>
  );
}
