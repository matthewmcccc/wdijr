import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react"
import { ChevronDownIcon } from "@heroicons/react/20/solid"

const Dropdown = () => {
    return (
        <Menu as="div" className="relative inline-block">
            <MenuButton className="inline-flex w-full justify-center gap-x-1.5 border border-gray-300 rounded-md 0 px-3 py-2 text-sm font-semibold font-dewi text-black cursor-pointer">
                Filter By
                <ChevronDownIcon aria-hidden="true" className="-mr-1 size-5 text-gray-400" />
            </MenuButton>

            <MenuItems
                transition
                className="text-black absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white border border-gray-300 outline-1 -outline-offset-1 outline-white/10 transition data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in cur"
            >
                <div className="">
                    <MenuItem>
                        <a
                        className="block px-4 py-2 text-sm cursor-pointer hover:bg-gray-100 transition-colors duration-300"
                        >
                        Default
                        </a>
                    </MenuItem>
                    <MenuItem>
                        <a
                        className="block px-4 py-2 text-sm cursor-pointer hover:bg-gray-100 transition-colors duration-300"
                        >
                        A-Z Descending
                        </a>
                    </MenuItem>
                    <MenuItem>
                        <a
                        className="block px-4 py-2 text-sm cursor-pointer hover:bg-gray-100 transition-colors duration-300"
                        >
                        A-Z Ascending
                        </a>
                    </MenuItem>
                </div>
            </MenuItems>
        </Menu>
    )
}

export default Dropdown;