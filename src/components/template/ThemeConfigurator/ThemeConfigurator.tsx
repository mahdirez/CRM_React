import ModeSwitcher from './ModeSwitcher'
import ThemeSwitcher from './ThemeSwitcher'

export type ThemeConfiguratorProps = {
    callBackClose?: () => void
}

const ThemeConfigurator = ({ callBackClose }: ThemeConfiguratorProps) => {
    return (
        <div className="flex flex-col h-full justify-between">
            <div className="flex flex-col gap-y-10 mb-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h6>حالت تاریک</h6>
                        <span>تغییر تم به حالت تاریک</span>
                    </div>
                    <ModeSwitcher />
                </div>
                <div>
                    <h6 className="mb-3">تم</h6>
                    <ThemeSwitcher />
                </div>
            </div>
        </div>
    )
}

export default ThemeConfigurator
