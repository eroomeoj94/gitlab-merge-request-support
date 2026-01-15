import Alert from '@mui/material/Alert';

type ErrorAlertProps = {
  readonly message: string;
};

export default function ErrorAlert({ message }: ErrorAlertProps) {
  return (
    <Alert severity="error" sx={{ mb: 3 }}>
      {message}
    </Alert>
  );
}
