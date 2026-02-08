import { WorkflowComponentRegistration } from 'shared-types';
import { CreateUserForm } from './components/CreateUserForm';
import { UserDetailView } from './components/UserDetailView';

export const userWorkflowRegistration: WorkflowComponentRegistration = {
    actionType: 'create_user',
    metadata: {
        name: 'Create User',
        description: 'Create a new user account in the system',
        category: 'User Management',
        icon: '👤',
    },
    components: {
        CreateForm: CreateUserForm,
        DetailView: UserDetailView,
    },
};
