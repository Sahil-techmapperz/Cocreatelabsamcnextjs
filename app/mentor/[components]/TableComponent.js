import Link from "next/link";

export const TableComponent = ({ data }) => {
    const formatDate = (dateString) => {
        const date = new Date(dateString);
      
        const day = new Intl.DateTimeFormat('en-GB', { day: 'numeric' }).format(date);
        const month = new Intl.DateTimeFormat('en-GB', { month: 'long' }).format(date);
        const year = new Intl.DateTimeFormat('en-GB', { year: 'numeric' }).format(date);
        const time = new Intl.DateTimeFormat('en-GB', {
          hour: 'numeric',
          minute: 'numeric',
          hour12: true,
        }).format(date);
      
        return `${day} ${month} ${year}, at ${time}`;
      };
    return (
        <div className='shadow-md ml-[5px] rounded-lg my-6 p-4 max-w-full overflow-x-auto text-black'>
            <h2 className="text-xl md:text-lg font-bold mb-4">Last Book Sessions</h2>
            <div className="min-w-[320px]">
                <table className="w-full" style={{ margin: '0' }}>
                    <thead className="bg-gray-50" >
                        <tr>
                            <th className="px-2 py-2 text-xs md:text-sm">Mentee Name</th>
                            <th className="px-2 py-2 text-xs md:text-sm">Start Time</th>
                            <th className="px-2 py-2 text-xs md:text-sm">End Date</th>
                            <th className="px-2 py-2 text-xs md:text-sm">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((item, index) => (
                            <tr key={index}>
                                <td className="border border-gray-300 px-2 py-2 text-xs md:text-sm">
                                    <div className='flex items-center space-x-2'>
                                        <img className='rounded-full w-12 h-12 md:w-14 md:h-14' src={item.Client.profilePictureUrl || 'https://via.placeholder.com/150'} alt="Profile" />
                                        <div className='flex flex-col'>
                                            <span>{item.Client.name}</span>
                                            <span className="text-xs"> email - {item.Client.email}</span>
                                        </div>
                                    </div>
                                </td>
                                <td className="border border-gray-300 px-2 py-2 text-xs md:text-sm">{formatDate(item.startTime)}</td>
                                <td className="border border-gray-300 px-2 py-2 text-xs md:text-sm">{formatDate(item.endTime)}</td>
                                <td className="border border-gray-300 px-2 py-2 text-xs md:text-sm">
                                    <div className='flex gap-1 items-center'>
                                        <Link target='_blank' href={item.sessionLink} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Join</Link>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

