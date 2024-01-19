class Assignment {
    constructor(id, courseId, code, name, description, createdAt, updatedAt) {
        this.id = id;
        this.courseId = courseId;
        this.code = code;
        this.name = name;
        this.description = description;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    // Endpoint base
    static baseUrl = "http://24.144.87.218/api/assignments";

    // Agregar o actualizar una asignación
    static async addOrUpdate(id, courseId, code, name, description) {
        const response = await fetch(`${this.baseUrl}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, courseId, code, name, description }),
        });
        return response.json();
    }
    
    static async add(courseId, code, name, description) {
        const response = await fetch(`${this.baseUrl}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId, code, name, description }),
        });
        return response.json();
    }

    static async update(id, courseId, code, name, description) {
        const response = await fetch(`${this.baseUrl}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, courseId, code, name, description }),
        });
        return response.json();
    }

    // Obtener asignaciones por ID de curso
    static async getByCourseId(courseId) {
        const response = await fetch(`${this.baseUrl}/course/${courseId}`);

        if (!response.ok) {
            return [];
        }

        return response.json();
    }

    // Obtener una asignación por ID
    static async getById(assignmentId) {
        const response = await fetch(`${this.baseUrl}/${assignmentId}`);
        if (!response.ok) {
            throw new Error("Asignación no encontrada");
        }
        return response.json();
    }

    // Eliminar una asignación
    static async delete(assignmentId) {
        const response = await fetch(`${this.baseUrl}/${assignmentId}`, {
            method: "DELETE",
        });
        return response.json();
    }
}

export default Assignment;
