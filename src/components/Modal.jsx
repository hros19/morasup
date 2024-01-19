const Modal = ({ isOpen, onClose, onAdd, comment, setComment }) => {
    if (!isOpen) return null;

    const handleChange = (e) => {
        setComment(e.target.value);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className="bg-gray-700 p-5 rounded-lg  w-3/5">
                <h3 className="font-semibold text-lg">Agregar Respuesta</h3>
                <textarea
                    className="w-full p-2 border border-gray-300 rounded mt-2"
                    rows="4"
                    maxLength="510"
                    placeholder="Escribe tu comentario aquí..."
                    value={comment}
                    onChange={handleChange}
                />
                <div className="flex justify-end space-x-2 mt-4">
                    <button onClick={onClose} className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded">
                        Cancelar
                    </button>
                    <button onClick={onAdd} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                        Agregar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Modal;
