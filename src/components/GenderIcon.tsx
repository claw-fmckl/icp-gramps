interface GenderIconProps {
  gender: bigint;
  className?: string;
}

export function GenderIcon({ gender, className = '' }: GenderIconProps) {
  const genderNum = Number(gender);
  
  if (genderNum === 1) {
    return <span className={className} title="Male">♂</span>;
  }
  if (genderNum === 2) {
    return <span className={className} title="Female">♀</span>;
  }
  return <span className={className} title="Unknown">?</span>;
}
