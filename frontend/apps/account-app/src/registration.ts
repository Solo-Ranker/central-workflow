import { WorkflowComponentRegistration } from 'shared-types';
import { CreateAccountForm } from './components/CreateAccountForm';
import { AccountDetailView } from './components/AccountDetailView';

export const accountWorkflowRegistration: WorkflowComponentRegistration = {
    actionType: 'create_account',
    metadata: {
        name: 'Create Account',
        description: 'Create a new financial account for a user',
        category: 'Account Management',
        icon: '💳',
    },
    components: {
        CreateForm: CreateAccountForm,
        DetailView: AccountDetailView,
    },
};
