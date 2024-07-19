export const ParticipantList = ({ eventId, eventMembers, navigate }) => {
  const filteredMembers = eventMembers.filter(
    (member) => member.eventId === eventId
  );
  const participantButtons = filteredMembers.map((member) => (
    <button
      key={member.memberId}
      onClick={() => navigate(`/eventcancel/${eventId}`)}
    >
      {member.accountname}
    </button>
  ));
  return <div className="participant-list">{participantButtons}</div>;
};
