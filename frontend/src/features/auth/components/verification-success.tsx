interface VerificationSuccessProps {
  message: string;
}

export function VerificationSuccess({ message }: VerificationSuccessProps): JSX.Element {
  return <div className="text-sm text-green-700 bg-green-100 p-3 rounded mb-4">{message}</div>;
}
