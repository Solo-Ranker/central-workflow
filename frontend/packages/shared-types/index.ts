import React from "react";

export interface WorkflowComponentRegistration {
  actionType: string;  // e.g., "create_user"
  metadata: {
    name: string;
    description: string;
    icon?: string;
    category?: string;
  };
  components: {
    CreateForm: React.ComponentType<CreateFormProps>;
    DetailView: React.ComponentType<DetailViewProps>;
  };
}

export interface CreateFormProps {
  onSubmit: (data: unknown) => Promise<void>;  // Triggers backend action
  onCancel: () => void;
}

export interface DetailViewProps {
  isChecker: boolean;
  data: unknown;
  status: "PENDING" | "APPROVED" | "REJECTED";
  onApprove: () => void;
  onReject: (reason: string) => void;
}

export enum ActionTypes {
  CREATE_USER = 'create_user',
  CREATE_ACCOUNT = 'create_account',
  CREATE_PROMOTION = 'create_promotion',
}