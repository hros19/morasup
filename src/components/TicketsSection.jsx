

const TicketsSection = ({ tickets, onTicketClick }) => {
    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric', locale: 'es' };
        return new Date(dateString).toLocaleDateString('es-ES', options);
    };

    const statusBadge = (status) => {
        const color = status === 'pending' ? 'bg-yellow-500' : 'bg-green-500';
        const text = status === 'pending' ? 'Pendiente' : 'Cerrado';
        return <span className={`absolute top-2 right-2 text-white text-xs px-2 py-1 rounded ${color}`}>{text}</span>;
    };

    const Tags = ({ course, assignment }) => (
        <div className="flex space-x-2 mt-2">
            {course && (
                <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded">
                    {course.name}
                </span>
            )}
            {assignment && (
                <span className="bg-green-500 text-white text-xs px-2 py-1 rounded">
                    {assignment.name}
                </span>
            )}
        </div>
    );

    return (
        <div className="tickets-container w-full mx-auto my-5 bg-white shadow-lg rounded-lg p-6 overflow-y-auto mb-20" style={{ maxHeight: 'calc(100vh - 150px)' }}>
            {tickets.length === 0 ? (
                <div className="text-center text-2xl font-semibold text-black">
                    <p>📭 No tienes tickets en este momento.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {tickets.map((ticket) => (
                        <div
                            key={ticket.id}
                            className="relative bg-gray-100 p-4 rounded-lg shadow hover:bg-gray-200 cursor-pointer transition duration-300"
                            onClick={() => onTicketClick(ticket)}
                        >
                            {statusBadge(ticket.status)}
                            <h3 className="text-lg font-semibold mb-2 text-black">{ticket.title}</h3>
                            <p className="text-gray-600 overflow-hidden text-ellipsis" style={{ maxHeight: '4rem', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>{ticket.description}</p>
                            <Tags course={ticket.course} assignment={ticket.assignment} />
                            <p className="text-sm text-gray-500 mt-2">Creado el: {formatDate(ticket.created_at)}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default TicketsSection;
