import { useState } from "react"
import DeliveryTimesService from "../Services/DeliveryTimesService"

/** Alte API-Antworten: keinen Sperr-Hinweis neben gültigen Slots anzeigen */
function sanitizeOrderTimesMessage(msg, options, isTomorrow) {
    const s = String(msg ?? "")
    /* Kundenwunsch: diesen Hinweis nicht unter der Wunschzeit anzeigen */
    if (/Außerhalb der Öffnungszeiten/i.test(s) && /Frühester Termin ist morgen/i.test(s)) return ""
    if (/Leider sind derzeit keine Bestellungen/i.test(s)) return ""
    if (/Erlaubte Bestellzeiten heute/i.test(s)) return ""
    if (!isTomorrow && Array.isArray(options) && options.length > 0) return ""
    return s
}

const useGetDeliveryTimes = () => {

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [times, setTimes] = useState([])
    const [dateOptions, setDateOptions] = useState([])
    const [selectedDate, setSelectedDate] = useState("")
    const [message, setMessage] = useState("")
    const [isAvailable, setIsAvailable] = useState(true)
    const [isTomorrow, setIsTomorrow] = useState(false)
    
    const getDeliveryTimes = async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await DeliveryTimesService.getDeliveryTimes();
            if (res) {
                const raw = res.options ?? res.Options ?? [];
                const opts = Array.isArray(raw) ? raw : []
                const rawDates = res.dateOptions ?? res.DateOptions ?? []
                const dates = Array.isArray(rawDates) ? rawDates : []
                const isTom = res.isTomorrow === true || res.IsTomorrow === true
                setMessage(sanitizeOrderTimesMessage(res.message ?? res.Message ?? "", opts, isTom))
                setIsAvailable(res.isVisible !== false && res.IsVisible !== false)
                setIsTomorrow(isTom)
                setDateOptions(dates)
                setSelectedDate(res.selectedDate ?? res.SelectedDate ?? dates[0]?.date ?? dates[0]?.Date ?? "")
                setTimes(opts)
            } else {
                setTimes([])
                setDateOptions([])
                setSelectedDate("")
                setIsAvailable(false)
                setIsTomorrow(false)
                setMessage(
                    "Lieferzeiten konnten nicht geladen werden. Bitte Verbindung prüfen oder Seite neu laden."
                )
            }
        }
        catch (err) {
            setError(err)
            setTimes([])
            setDateOptions([])
            setSelectedDate("")
            setIsAvailable(false)
            setIsTomorrow(false)
            setMessage("Lieferzeiten konnten nicht geladen werden. Bitte später erneut versuchen.")
        }
        finally {
            setLoading(false);
        }
    }
    return {
        loading, error, getDeliveryTimes, times, dateOptions, selectedDate, isAvailable, message, isTomorrow
    }
}

export default useGetDeliveryTimes
