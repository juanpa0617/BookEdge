"use client"

import { toast } from "react-toastify"
import "./componentsReservations.css"
import { useState, useRef } from "react"
import PropTypes from "prop-types"



// Función para formatear moneda
const formatCurrency = (amount) => {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount || 0)
}

// Componente de selector de cantidad
function QuantitySelector({ value, onChange, min = 0, max = 99, disabled = false }) {
  const handleDecrease = () => {
    if (value > min) {
      onChange(value - 1)
    }
  }

  const handleIncrease = () => {
    if (value < max) {
      onChange(value + 1)
    }
  }

  const handleInputChange = (e) => {
    const newValue = Number.parseInt(e.target.value) || 0
    if (newValue >= min && newValue <= max) {
      onChange(newValue)
    }
  }

  return (
    <div className="quantity-selector">
      <button
        type="button"
        className="quantity-btn decrease"
        onClick={handleDecrease}
        disabled={disabled || value <= min}
        aria-label="Disminuir cantidad"
      >
        −
      </button>
      <input
        type="number"
        className="quantity-input"
        value={value}
        onChange={handleInputChange}
        min={min}
        max={max}
        disabled={disabled}
        aria-label="Cantidad"
      />
      <button
        type="button"
        className="quantity-btn increase"
        onClick={handleIncrease}
        disabled={disabled || value >= max}
        aria-label="Aumentar cantidad"
      >
        +
      </button>
    </div>
  )
}

export function BasicInfoStep({
  formData,
  errors,
  users = [],
  planes = [],
  loading,
  isReadOnly,
  onChange,
  isClientMode = false,
  clientUser = null,
}) {
  const [searchTerm, setSearchTerm] = useState("");
const [filteredUsers, setFilteredUsers] = useState([]);
const [showSuggestions, setShowSuggestions] = useState(false);

  // Mantener toda la lógica de validación de fechas original
  const handleDateChange = (e) => {
    const { name, value } = e.target

    // Validate that end date is not before start date
    if (name === "endDate" && formData.startDate && value < formData.startDate) {
      toast.error("La fecha de fin no puede ser anterior a la fecha de inicio", {
        position: "top-right",
        autoClose: 5000,
      })
      return
    }

    // Validate that dates are not in the past
    const today = new Date().toISOString().split("T")[0]
    if (value < today) {
      toast.warning("Se recomienda no seleccionar fechas pasadas", {
        position: "top-right",
        autoClose: 5000,
      })
    }

    onChange(e)

    // If end date is before the new start date, clear it
    if (name === "startDate" && formData.endDate && value > formData.endDate) {
      setTimeout(() => {
        onChange({ target: { name: "endDate", value: "" } })
        toast.info("Fecha de fin actualizada automáticamente", {
          position: "top-right",
          autoClose: 3000,
        })
      }, 0)
    }
  }

  return (
    <div className="step-content">
      {/* Primera fila - Cliente y Plan */}
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="idUser" className="form-label">
            Cliente *
          </label>

          {isClientMode ? (
            // Modo cliente: Mostrar información del cliente logueado
            <div className="client-info-display">
              <div className="client-card">
                <div className="client-avatar">{clientUser?.name?.charAt(0)?.toUpperCase() || "C"}</div>
                <div className="client-details">
                  <h4>{clientUser?.name || "Cliente"}</h4>
                  <p>{clientUser?.email || "Sin email"}</p>
                  <span className="client-id">ID: {clientUser?.idUser}</span>
                </div>
                <span className="client-mode-badge">Tú</span>
              </div>
            </div>
          ) : (
            // Modo admin: Selector de cliente
            <div className="user-search-container" style={{ position: "relative" }}>
              <input
                type="text"
                className="user-search-input"
                placeholder="Buscar cliente por nombre o identificación"
                value={
                  formData.idUser
                    ? users.find(u => u.idUser === Number(formData.idUser))?.name + " - " + users.find(u => u.idUser === Number(formData.idUser))?.identification
                    : searchTerm
                }
                onChange={e => {
                  setSearchTerm(e.target.value);
                  setShowSuggestions(true);
                  onChange({ target: { name: "idUser", value: "" } }); // Limpia el idUser hasta que seleccione
                }}
                onFocus={() => setShowSuggestions(true)}
                disabled={loading || isReadOnly}
                autoComplete="off"
              />
              {showSuggestions && searchTerm && (
                <ul className="autocomplete-suggestions">
                  {users
                    .filter(
                      user =>
                        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        (user.identification && user.identification.toLowerCase().includes(searchTerm.toLowerCase()))
                    )
                    .map(user => (
                      <li
                        key={user.idUser}
                        onClick={() => {
                          onChange({ target: { name: "idUser", value: user.idUser } });
                          setSearchTerm(user.name + " - " + user.identification);
                          setShowSuggestions(false);
                        }}
                      >
                        {user.name} - {user.identification}
                      </li>
                    ))}
                  {users.filter(
                    user =>
                      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      (user.identification && user.identification.toLowerCase().includes(searchTerm.toLowerCase()))
                  ).length === 0 && (
                    <li className="no-suggestions">No hay resultados</li>
                  )}
                </ul>
              )}
            </div>
          )}

          {errors.idUser && <span className="error-message">{errors.idUser}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="idPlan" className="form-label">
            Plan *
          </label>
          <select
            id="idPlan"
            name="idPlan"
            value={formData.idPlan}
            onChange={(e) => {
              onChange(e)
              // Toast cuando se selecciona un plan
              if (e.target.value) {
                const selectedPlan = planes.find((p) => p.idPlan === Number.parseInt(e.target.value))
                if (selectedPlan) {
                  toast.success(`Plan seleccionado: ${selectedPlan.name}`, {
                    position: "top-right",
                    autoClose: 3000,
                  })
                }
              }
            }}
            disabled={loading || isReadOnly}
            className={`form-input ${errors.idPlan ? "error" : ""}`}
          >
            <option value="">Seleccione un plan</option>
            {planes.map((plan) => (
              <option key={plan.idPlan} value={plan.idPlan}>
                {plan.name} - {formatCurrency(plan.salePrice || plan.price)}
              </option>
            ))}
          </select>
          {errors.idPlan && <span className="error-message">{errors.idPlan}</span>}
        </div>
      </div>

      {/* Segunda fila - Fechas */}
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="startDate" className="form-label">
            Fecha de Inicio *
          </label>
          <input
            type="date"
            id="startDate"
            name="startDate"
            value={formData.startDate}
            onChange={handleDateChange}
            min={new Date().toISOString().split("T")[0]}
            disabled={loading || isReadOnly}
            className={`form-input ${errors.startDate ? "error" : ""}`}
          />
          {errors.startDate && <span className="error-message">{errors.startDate}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="endDate" className="form-label">
            Fecha de Fin *
          </label>
          <input
            type="date"
            id="endDate"
            name="endDate"
            value={formData.endDate}
            onChange={handleDateChange}
            min={formData.startDate || new Date().toISOString().split("T")[0]}
            disabled={loading || isReadOnly}
            className={`form-input ${errors.endDate ? "error" : ""}`}
          />
          {errors.endDate && <span className="error-message">{errors.endDate}</span>}
        </div>
      </div>

      {/* Tercera fila - Configuración de acompañantes */}
      <div className="form-row">
        <div className="form-group">
          <div className="checkbox-container">
            <label className="checkbox-option">
              <input
                type="checkbox"
                name="hasCompanions"
                checked={formData.hasCompanions}
                onChange={(e) => {
                  onChange(e)
                }}
                disabled={loading || isReadOnly}
              />
              <span className="checkbox-custom"></span>
              <span className="checkbox-label">¿Incluye acompañantes?</span>
            </label>
          </div>
        </div>

        {formData.hasCompanions && (
          <div className="form-group">
            <label htmlFor="companionCount" className="form-label">
              Número de Acompañantes *
            </label>
            <input
              type="number"
              id="companionCount"
              name="companionCount"
              min="1"
              max="6"
              value={formData.companionCount}
              onChange={(e) => {
                const count = Number(e.target.value)
                if (count > 6) {
                  toast.warning("Máximo 6 acompañantes permitidos", {
                    position: "top-right",
                    autoClose: 4000,
                  })
                  return
                }
                onChange(e)
              }}
              disabled={loading || isReadOnly}
              className={`form-input ${errors.companionCount ? "error" : ""}`}
              placeholder="Ej: 2"
            />
            {errors.companionCount && <span className="error-message">{errors.companionCount}</span>}
            <div className="input-hint">Máximo 6 acompañantes por reserva</div>
          </div>
        )}
      </div>

      {formData.hasCompanions && formData.companionCount > 0 && (
        <div className="companions-info-card">
          <div className="info-header">
            <span className="info-icon">ℹ</span>
            <h4>Información sobre Acompañantes</h4>
          </div>
          <div className="info-content">
            <p>
              <strong>Total de huéspedes:</strong> {Number(formData.companionCount) + 1} personas (1 titular +{" "}
              {formData.companionCount} acompañante{formData.companionCount > 1 ? "s" : ""})
            </p>
            <p>
              <strong>Tipo de alojamiento requerido:</strong>{" "}
              {formData.companionCount > 1 ? "Cabañas (para grupos)" : "Habitaciones o cabañas"}
            </p>
            <div className="info-note">
              En la siguiente pestaña podrás registrar los datos personales de cada acompañante.
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

BasicInfoStep.propTypes = {
  formData: PropTypes.object.isRequired,
  errors: PropTypes.object,
  users: PropTypes.array,
  planes: PropTypes.array,
  loading: PropTypes.bool,
  isReadOnly: PropTypes.bool,
  onChange: PropTypes.func.isRequired,
  isClientMode: PropTypes.bool,
  clientUser: PropTypes.object,
};

export function CompanionsStep({ formData, errors, loading, isReadOnly, onSaveCompanion, onDeleteCompanion }) {
  const expectedCount = Number.parseInt(formData.companionCount) || 0
  const currentCount = formData.companions?.length || 0
  const remainingCount = Math.max(0, expectedCount - currentCount)

  // Función para calcular la edad a partir de la fecha de nacimiento
  const calcularEdad = (fechaNacimiento) => {
    if (!fechaNacimiento) return "";
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const m = hoy.getMonth() - nacimiento.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    return edad;
  };

  const companionFormRef = useRef(null);

  return (
    <div className="step-content">



      {errors.companions && <div className="error-message">{errors.companions}</div>}

      {/* Lista de acompañantes */}
      <div className="companions-list">
        {formData.companions && formData.companions.length > 0 ? (
          formData.companions.map((companion, index) => {
            const companionKey =
              companion.idCompanions || companion.id || companion.tempId || companion.documentNumber || index
            const companionId = companion.idCompanions || companion.id || companion.tempId || companion.documentNumber

            return (
              <div key={companionKey} className="companion-card">
                <div className="companion-content">
                  <div className="companion-info">
                    <div className="companion-header">
                      <strong className="companion-name">{companion.name}</strong>
                      {companion.isTemporary && <span className="temp-badge">Temporal</span>}
                    </div>
                    <div className="companion-details">
                      <p>
                        <strong>Documento:</strong> {companion.documentType || "N/A"} - {companion.documentNumber}
                      </p>
                      <p>
                        <strong>Edad:</strong> {companion.age} años
                      </p>
                      <p>
                        <strong>EPS:</strong> {companion.eps}
                      </p>
                      {companion.birthdate && (
                        <p>
                          <strong>Fecha de nacimiento:</strong> {companion.birthdate}
                        </p>
                      )}
                    </div>
                  </div>
                  {!isReadOnly && (
                    <button
                      type="button"
                      onClick={() => onDeleteCompanion(companionId)}
                      disabled={loading}
                      className="delete-btn"
                    >
                      {loading ? "..." : "Eliminar"}
                    </button>
                  )}
                </div>
              </div>
            )
          })
        ) : (
          <div className="empty-companions">
            <p className="empty-title">👥 No hay acompañantes registrados</p>
          </div>
        )}
      </div>

      {/* Formulario de acompañante - Solo mostrar si se pueden agregar más */}
      {!isReadOnly && remainingCount > 0 && (
        <div className="companion-form-section">
          <div className="form-alert">
            <p>
              📝 Faltan {remainingCount} acompañante{remainingCount > 1 ? "s" : ""} por registrar
            </p>
          </div>

          <div
            ref={companionFormRef}
            className="companion-form"
            onKeyDown={e => {
              if (e.key === "Enter") {
                e.preventDefault();
              }
            }}
          >
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name" className="form-label">
                  Nombre completo *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className={`form-input ${errors.name ? "error" : ""}`}
                  disabled={loading}
                  placeholder="Nombre completo del acompañante"
                />
                {errors.name && <span className="error-message">{errors.name}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="documentType" className="form-label">
                  Tipo de documento *
                </label>
                <select id="documentType" name="documentType" className="form-input" disabled={loading}>
                  <option value="Cédula de ciudadanía">Cédula de Ciudadanía</option>
                  <option value="Tarjeta de identidad">Tarjeta de Identidad</option>
                  <option value="Cédula de extranjería">Cédula de Extranjería</option>
                  <option value="Pasaporte">Pasaporte</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="documentNumber" className="form-label">
                  Número de documento *
                </label>
                <input
                  type="text"
                  id="documentNumber"
                  name="documentNumber"
                  className={`form-input ${errors.documentNumber ? "error" : ""}`}
                  disabled={loading}
                  placeholder="Número de documento"
                />
                {errors.documentNumber && <span className="error-message">{errors.documentNumber}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="age" className="form-label">
                  Edad *
                </label>
                <input
                  type="number"
                  id="age"
                  name="age"
                  className={`form-input ${errors.age ? "error" : ""}`}
                  disabled={loading}
                  min="0"
                  max="120"
                  placeholder="Edad"
                  readOnly // Opcional: para que solo se calcule automáticamente
                />
                {errors.age && <span className="error-message">{errors.age}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="eps" className="form-label">
                  EPS *
                </label>
                <input
                  type="text"
                  id="eps"
                  name="eps"
                  className={`form-input ${errors.eps ? "error" : ""}`}
                  disabled={loading}
                  placeholder="Entidad de salud"
                />
                {errors.eps && <span className="error-message">{errors.eps}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="birthdate" className="form-label">
                  Fecha de nacimiento
                </label>
                <input
                  type="date"
                  id="birthdate"
                  name="birthdate"
                  className="form-input"
                  disabled={loading}
                  onChange={e => {
                    const form = companionFormRef.current;
                    const birthdate = e.target.value;
                    const edadCalculada = calcularEdad(birthdate);
                    form.querySelector('[name="age"]').value = edadCalculada;
                  }}
                />
              </div>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="submit-btn"
                disabled={loading}
                onClick={() => {
                  const form = companionFormRef.current;
                  if (!form) return;
                  const newCompanion = {
                    name: form.querySelector('[name="name"]').value,
                    documentType: form.querySelector('[name="documentType"]').value,
                    documentNumber: form.querySelector('[name="documentNumber"]').value,
                    age: form.querySelector('[name="age"]').value,
                    eps: form.querySelector('[name="eps"]').value,
                    birthdate: form.querySelector('[name="birthdate"]').value,
                  };
                  onSaveCompanion(newCompanion);
                }}
              >
                {loading ? "Guardando..." : "Agregar Acompañante"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mensaje de finalización */}
      {currentCount === expectedCount && expectedCount > 0 && (
        <div className="completion-message">
          <h4>✅ ¡Todos los acompañantes han sido registrados!</h4>
          <p>Puedes continuar al siguiente paso o agregar/eliminar acompañantes si es necesario.</p>
        </div>
      )}
    </div>
  )
}

CompanionsStep.propTypes = {
  formData: PropTypes.object.isRequired,
  errors: PropTypes.object,
  loading: PropTypes.bool,
  isReadOnly: PropTypes.bool,
  onSaveCompanion: PropTypes.func.isRequired,
  onDeleteCompanion: PropTypes.func.isRequired,
};

export function AvailabilityStep({
  formData,
  errors,
  onCabinSelect,
  onRoomSelect,
  onServiceQuantityChange,
}) {
  const companionCount = formData.companionCount || 0
  const totalGuests = companionCount + 1

  // Función para obtener la cantidad actual de un servicio
  const getServiceQuantity = (serviceId) => {
    const service = formData.selectedServices?.find((s) => s.serviceId === serviceId)
    return service ? service.quantity : 0
  }

  // Función para manejar cambios de cantidad con toasts
  const handleQuantityChange = (serviceId, newQuantity) => {
    const service = formData.availableServices?.find((s) => s.Id_Service === serviceId)
    const serviceName = service?.name || "Servicio"

    if (newQuantity === 0) {
      toast.info(`${serviceName} eliminado de la selección`, {
        position: "top-right",
        autoClose: 3000,
      })
    } else if (getServiceQuantity(serviceId) === 0) {
      toast.success(`${serviceName} agregado (x${newQuantity})`, {
        position: "top-right",
        autoClose: 3000,
      })
    }

    onServiceQuantityChange(serviceId, newQuantity)
  }

  // Función para manejar selección de cabaña con toast
  const handleCabinSelect = (cabinId) => {
    const cabin = formData.availableCabins?.find((c) => c.idCabin === cabinId)
    const cabinName = cabin?.name || `Cabaña ${cabinId}`

    if (formData.idCabin === cabinId) {
      toast.info(`${cabinName} deseleccionada`, {
        position: "top-right",
        autoClose: 3000,
      })
    } else {
      toast.success(`${cabinName} seleccionada`, {
        position: "top-right",
        autoClose: 3000,
      })
    }

    onCabinSelect(cabinId)
  }

  // Función para manejar selección de habitación con toast
  const handleRoomSelect = (roomId) => {
    const room = formData.availableBedrooms?.find((r) => r.idRoom === roomId)
    const roomName = room?.name || `Habitación ${roomId}`

    if (formData.idRoom === roomId) {
      toast.info(`${roomName} deseleccionada`, {
        position: "top-right",
        autoClose: 3000,
      })
    } else {
      toast.success(`${roomName} seleccionada`, {
        position: "top-right",
        autoClose: 3000,
      })
    }

    onRoomSelect(roomId)
  }

  return (
    <div className="step-content">


      <div className="guest-info">
        <p>
          <strong>Huéspedes totales:</strong> {totalGuests} persona{totalGuests !== 1 ? "s" : ""}
        </p>
        <p>
          <strong>Alojamiento disponible:</strong>
          {formData.availableCabins?.length > 0 && formData.availableBedrooms?.length > 0
            ? "Cabañas y habitaciones"
            : formData.availableCabins?.length > 0
              ? "Solo cabañas"
              : formData.availableBedrooms?.length > 0
                ? "Solo habitaciones"
                : "Sin disponibilidad"}
        </p>
      </div>

      {errors.accommodation && <div className="error-message">{errors.accommodation}</div>}

      {/* Sección de cabañas */}
      {formData.availableCabins?.length > 0 && (
        <div className="section-container">
          <h4 className="section-title">
            Cabañas Disponibles ({formData.availableCabins.length})
            {totalGuests > 4 && <span className="recommended-badge">Recomendado para {totalGuests} personas</span>}
          </h4>

          <div className="options-grid">
            {formData.availableCabins.map((cabin) => (
              <div
                key={cabin.idCabin}
                className={`option-item ${formData.idCabin === cabin.idCabin ? "selected" : ""}`}
                onClick={() => handleCabinSelect(cabin.idCabin)}
              >
                <div className="option-selector">
                  {formData.idCabin === cabin.idCabin ? (
                    <span className="selected-icon">✓</span>
                  ) : (
                    <span className="unselected-icon">○</span>
                  )}
                </div>
                <div className="option-content">
                  <h5 className="option-name">{cabin.name}</h5>
                  <p className="option-detail">
                    Capacidad: {cabin.capacity || 7} personas
                    {cabin.capacity >= totalGuests && <span className="capacity-ok"> ✓</span>}
                  </p>
                  <p className="option-description">{cabin.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sección de habitaciones */}
      {formData.availableBedrooms?.length > 0 && (
        <div className="section-container">
          <h4 className="section-title">
            Habitaciones Disponibles ({formData.availableBedrooms.length})
            {totalGuests <= 2 && (
              <span className="recommended-badge">
                Recomendado para {totalGuests} persona{totalGuests !== 1 ? "s" : ""}
              </span>
            )}
          </h4>

          <div className="options-grid">
            {formData.availableBedrooms.map((bedroom) => (
              <div
                key={bedroom.idRoom}
                className={`option-item ${formData.idRoom === bedroom.idRoom ? "selected" : ""}`}
                onClick={() => handleRoomSelect(bedroom.idRoom)}
              >
                <div className="option-selector">
                  {formData.idRoom === bedroom.idRoom ? (
                    <span className="selected-icon">✓</span>
                  ) : (
                    <span className="unselected-icon">○</span>
                  )}
                </div>
                <div className="option-content">
                  <h5 className="option-name">Habitación {bedroom.name || bedroom.idRoom}</h5>
                  <p className="option-detail">
                    Capacidad: {bedroom.capacity || 2} personas
                    {(bedroom.capacity || 2) >= totalGuests && <span className="capacity-ok"> ✓</span>}
                  </p>
                  <p className="option-description">{bedroom.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mensaje cuando no hay alojamiento disponible */}
      {(!formData.availableCabins || formData.availableCabins.length === 0) &&
        (!formData.availableBedrooms || formData.availableBedrooms.length === 0) && (
          <div className="no-options">
            <h4>❌ No hay alojamiento disponible</h4>
            <p>
              No se encontraron cabañas ni habitaciones con capacidad para {totalGuests} persona
              {totalGuests !== 1 ? "s" : ""}.
            </p>
            <p>Por favor, reduce el número de acompañantes o contacta al administrador.</p>
          </div>
        )}

      {/* Servicios adicionales */}
      <div className="section-container">
        <h4 className="section-title">Servicios Adicionales</h4>

        {formData.availableServices?.length > 0 ? (
          <div className="services-grid">
            {formData.availableServices.map((service) => {
              const currentQuantity = getServiceQuantity(service.Id_Service)
              const isSelected = currentQuantity > 0

              return (
                <div key={service.Id_Service} className={`service-item ${isSelected ? "selected" : ""}`}>
                  <div className="service-info">
                    <div className="service-header">
                      <h5 className="service-name">{service.name}</h5>
                      <span className="service-price">{formatCurrency(service.Price)}</span>
                    </div>
                    <p className="service-description">{service.Description}</p>
                  </div>

                  <div className="service-controls">
                    <QuantitySelector
                      value={currentQuantity}
                      onChange={(newQuantity) => handleQuantityChange(service.Id_Service, newQuantity)}
                      min={0}
                      max={20}
                    />
                    {currentQuantity > 0 && (
                      <div className="service-subtotal">
                        Subtotal: {formatCurrency(service.Price * currentQuantity)}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <p className="no-options">No hay servicios disponibles</p>
        )}

        {/* Resumen de servicios seleccionados */}
        {formData.selectedServices && formData.selectedServices.length > 0 && (
          <div className="services-summary">
            <h5>Servicios seleccionados:</h5>
            <div className="selected-services-list">
              {formData.selectedServices.map((serviceSelection) => {
                const service = formData.availableServices.find((s) => s.Id_Service === serviceSelection.serviceId)
                if (!service) return null

                return (
                  <div key={serviceSelection.serviceId} className="selected-service-item">
                    <span className="service-name">{service.name}</span>
                    <span className="service-quantity">x{serviceSelection.quantity}</span>
                    <span className="service-total">{formatCurrency(service.Price * serviceSelection.quantity)}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

AvailabilityStep.propTypes = {
  formData: PropTypes.object.isRequired,
  errors: PropTypes.object,
  loading: PropTypes.bool,
  onCabinSelect: PropTypes.func.isRequired,
  onRoomSelect: PropTypes.func.isRequired,
  onServiceToggle: PropTypes.func.isRequired,
  onServiceQuantityChange: PropTypes.func.isRequired,
};

export function PaymentStep({
  totalAmount,
  reservationPayments,
  tempPayments,

  isReadOnly,
  loading,
  onPaymentSubmit,
}) {
  // Combinar pagos de la reserva y pagos temporales
  const allPayments = [...(reservationPayments || []), ...(tempPayments || [])]

  // Calcular totales
  const totalPaid = allPayments.reduce((sum, payment) => {
    return payment.status !== "Anulado" ? sum + (Number(payment.amount) || 0) : sum
  }, 0)

  const remainingBalance = Math.max(0, totalAmount - totalPaid)

  return (
    <div className="step-content">

      {/* Resumen de pagos */}


      {/* Formulario de pago */}
      {!isReadOnly && (
        <div className="payment-form-section">
          <div className="payment-form" onKeyDown={e => {
  if (e.key === "Enter") {
    e.preventDefault();
    // Opcional: podrías llamar aquí a tu función de registrar pago si lo deseas
  }
}}>
    <div className="form-row">
      <div className="form-group">
        <label htmlFor="paymentMethod" className="form-label">
          Método de pago *
        </label>
        <select id="paymentMethod" name="paymentMethod" className="form-input" disabled={loading}>
          <option value="">Seleccione un método</option>
          <option value="Tarjeta de Crédito">Tarjeta de Crédito</option>
          <option value="Tarjeta de Débito">Tarjeta de Débito</option>
          <option value="Transferencia Bancaria">Transferencia Bancaria</option>
          <option value="Efectivo">Efectivo</option>
          <option value="Otro">Otro</option>
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="paymentDate" className="form-label">
          Fecha de pago *
        </label>
        <input
          type="date"
          id="paymentDate"
          name="paymentDate"
          defaultValue={new Date().toISOString().split("T")[0]}
          className="form-input"
          disabled={loading}
        />
      </div>
    </div>

    <div className="form-row">
      <div className="form-group">
        <label htmlFor="amount" className="form-label">
          Monto *
        </label>
        <input
          type="number"
          id="amount"
          name="amount"
          className="form-input"
          disabled={loading}
          placeholder="0"
          min="0"
          step="1000"
        />
      </div>

      <div className="form-group">
        <label htmlFor="status" className="form-label">
          Estado
        </label>
        <select id="status" name="status" defaultValue="Pendiente" className="form-input" disabled={loading}>
          <option value="Pendiente">Pendiente</option>
          <option value="Confirmado">Confirmado</option>
        </select>
      </div>
    </div>

    <div className="form-row">
      <div className="form-group">
        <label htmlFor="voucher" className="form-label">
          Comprobante de pago
        </label>
        <input
          type="file"
          id="voucher"
          name="voucher"
          className="form-input"
          disabled={loading}
          accept="image/*,.pdf"
        />
        <div className="input-hint">Formatos permitidos: JPG, PNG, PDF (máx. 5MB)</div>
      </div>
    </div>

    <div className="form-actions">
      <button
        type="button"
        className="submit-btn"
        disabled={loading}
        onClick={e => {
          const form = e.target.closest('.payment-form');
          const paymentMethod = form.querySelector('[name="paymentMethod"]').value;
          const paymentDate = form.querySelector('[name="paymentDate"]').value;
          const amount = form.querySelector('[name="amount"]').value;
          const status = form.querySelector('[name="status"]').value;
          const voucherInput = form.querySelector('[name="voucher"]');
          const voucher = voucherInput && voucherInput.files.length > 0 ? voucherInput.files[0] : null;

          if (!paymentMethod || !paymentDate || !amount) {
            alert("Por favor complete todos los campos obligatorios.");
            return;
          }

          // Si hay comprobante, usa FormData
          if (voucher) {
            const formData = new FormData();
            formData.append("paymentMethod", paymentMethod);
            formData.append("paymentDate", paymentDate);
            formData.append("amount", amount);
            formData.append("status", status);
            formData.append("voucher", voucher);
            // Envía el FormData al handler del padre
            onPaymentSubmit(formData);
          } else {
            // Si no hay comprobante, envía objeto normal
            onPaymentSubmit({
              paymentMethod,
              paymentDate,
              amount,
              status,
            });
          }
        }}
      >
        {loading ? "Registrando..." : "Registrar Pago"}
      </button>
    </div>
  </div>
        </div>
      )}
    </div>
  )
}

PaymentStep.propTypes = {
  totalAmount: PropTypes.number.isRequired,
  reservationPayments: PropTypes.array,
  tempPayments: PropTypes.array,
  isReadOnly: PropTypes.bool,
  loading: PropTypes.bool,
  onPaymentSubmit: PropTypes.func.isRequired,
};
