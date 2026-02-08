import { WorkflowComponentRegistration } from '@repo/shared-types';
import { CreatePromotionForm } from './components/CreatePromotionForm';
import { PromotionDetailView } from './components/PromotionDetailView';

export const promotionWorkflowRegistration: WorkflowComponentRegistration = {
    actionType: 'create_promotion',
    metadata: {
        name: 'Create Promotion',
        description: 'Create a new promotional campaign',
        category: 'Marketing',
        icon: '🎉',
    },
    components: {
        CreateForm: CreatePromotionForm,
        DetailView: PromotionDetailView,
    },
};
