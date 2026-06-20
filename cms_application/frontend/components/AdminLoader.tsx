import { Loader } from './Loader';
export function AdminLoader({ label = 'Checking secure workspace' }: { label?: string }) { return <Loader label={label} />; }
