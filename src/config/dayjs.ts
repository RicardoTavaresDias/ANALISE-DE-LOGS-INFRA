import dayjs from "dayjs";
import "dayjs/locale/pt-br"
import isBetween from 'dayjs/plugin/isBetween'

dayjs.extend(isBetween);
dayjs.locale("pt-br")

export { dayjs }