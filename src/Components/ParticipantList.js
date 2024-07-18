export const ParticipantList = ({ eventId, eventMembers, navigate }) => {
  const filteredMembers = eventMembers.filter(
    (member) => member.eventId === eventId
  );
  const participantButtons = filteredMembers.map((member) => (
    <button
      key={member.memberId}
      onClick={() => navigate(`/eventcancel/${eventId}`)}
      style={{
        fontSize: "18px",
        padding: "1px 2px",
        marginBottom: "2px",
        fontWeight: "bolder",
      }}
    >
      {member.accountname}
    </button>
  ));
  return <div className="participant-list">{participantButtons}</div>;
};
