// import { useApolloClient } from "@apollo/client";
import gql from "graphql-tag";
import { useContext } from "react";
import { GroupFragmentDoc, useFindGroupQuery } from "src/apollo/graphql";
import { useJoinGroupMutation } from "src/apollo/graphql";
import { GroupForm } from "src/components/shared/GroupForm";
import { UserContext } from "src/contexts/UserContext";

type Props = {
  onHandleCloseRoot: () => void;
  onHandleClose: () => void;
  searchId: string;
};

export const GroupConfirmationForm = (props: Props) => {
  const { user } = useContext(UserContext);
  const { data, error } = useFindGroupQuery({
    variables: { searchId: props.searchId },
  });
  const [joinGroup] = useJoinGroupMutation({
    update(cache, { data }) {
      const newData = data?.joinGroup;
      cache.modify({
        fields: {
          groupsByUser(existing = []) {
            const newGroupRef = cache.writeFragment({
              data: newData,
              fragment: GroupFragmentDoc,
            });
            const newGroupData = {
              __typename: "MembershipModel",
              stateFlg: 0,
              group: newGroupRef,
            };
            return [...existing, newGroupData];
          },
        },
      });
    },
  });

  if (error) {
    props.onHandleClose();
  }
  const funcJoinGroup = async () => {
    await joinGroup({
      variables: { userId: user.id, searchId: props.searchId },
    });
    props.onHandleCloseRoot();
  };
  return (
    <div className="fixed top-0 md:top-28 z-20 p-6 w-full md:max-w-3xl lg:max-w-screen-sm h-full md:h-96 bg-black md:rounded-xl border border-gray-600">
      {data && (
        <GroupForm
          onHandleClose={props.onHandleClose}
          func={funcJoinGroup}
          groupItem={data?.findGroup}
          title={"参加"}
          toastValue={"グループに参加しました"}
          noChange
        />
      )}
    </div>
  );
};

gql`
  query findGroup($searchId: String!) {
    findGroup(searchId: $searchId) {
      id
      name
      iconUrl
    }
  }
  mutation joinGroup($userId: String!, $searchId: String!) {
    joinGroup(userId: $userId, searchId: $searchId) {
      id
      searchId
    }
  }
`;
