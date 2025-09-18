import axios from '../Axiosinstance';
import { toast } from 'react-toastify';

export const deleteEntity = async ({
    endpoint,
    entityId,
    fetchDataCallback,
    onSuccessMessage = 'Deleted successfully!',
    onErrorMessage = 'Failed to delete. Please try again.',
    onFinally = () => {},
    
}) => {
    try {
        await axios.delete(`${endpoint}/${entityId}`);
        toast.success(onSuccessMessage);
        await fetchDataCallback(); // Refresh the data
    } catch (error) {
        console.error('Error deleting entity:', error);
        toast.error(onErrorMessage, 'error');
    } finally {
        onFinally(); // Cleanup like closing dialog, resetting state
    }
};