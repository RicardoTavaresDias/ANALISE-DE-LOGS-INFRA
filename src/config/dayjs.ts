import dayjs from "dayjs";
import "dayjs/locale/pt-br"
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import isBetween from 'dayjs/plugin/isBetween'

dayjs.extend(isBetween);
// dayjs.extend(utc)
// dayjs.extend(timezone)
dayjs.locale("pt-br")

export { dayjs }