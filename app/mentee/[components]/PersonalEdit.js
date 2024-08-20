const PersonalEdit = ({ title, content, actionText,Openmodal }) => {
    return (
        <div className='flex justify-between items-center py-2'>
            <div>
                <p className='font-bold uppercase'>{title}</p>
                <p className='text-sm'>{content}</p>
            </div>
            <div className='cursor-pointer'>
                <button className='text-blue-500 hover:text-blue-700 font-bold ' onClick={Openmodal}>{actionText}</button>
            </div>
        </div>
    );
}

export default PersonalEdit;