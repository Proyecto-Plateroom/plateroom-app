interface ModalProps {
    children: React.ReactNode,
    open: boolean,
    fit?: boolean,
    onClose?: () => void,
};

export default function Modal({ children, open, fit = false, onClose }: ModalProps) {
    return (
        <dialog className="modal" open={open}>
            <div className={`modal-box ${fit ? "w-fit" : ""}`}>
                
                <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" onClick={onClose}>×</button>
                
                {children}
                
            </div>
        </dialog>
    );
}
