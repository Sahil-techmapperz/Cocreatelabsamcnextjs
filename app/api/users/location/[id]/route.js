import { NextResponse } from 'next/server';
import User from '@/models/User';
import dbConnect from '@/lib/mongodb';
import { checkTokenMiddleware } from '@/lib/middleware';
import { Country } from 'country-state-city';

const getCountryISOCode = (countryName) => {
    const country = Country.getAllCountries().find(country => country.name === countryName);
    return country ? country.isoCode : null;
};

export async function PUT(request, { params }) {
    const { id } = params;

    try {
        await dbConnect();
        await checkTokenMiddleware(request);

        const { timeZone, city, state, country } = await request.json();

        if (!timeZone || !country || !state || !city) {
            return NextResponse.json({ message: 'All location fields (timeZone, country, state, city) are required' }, { status: 400 });
        }

        const user = await User.findById(id);
        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        const countryISO = getCountryISOCode(country);
        if (!countryISO) {
            return NextResponse.json({ message: 'Invalid country name' }, { status: 400 });
        }

        user.location = {
            timeZone,
            country,
            state,
            city
        };

        await user.save();

        return NextResponse.json({ message: 'Location updated successfully', location: user.location });
    } catch (error) {
        return NextResponse.json({ message: 'Server error', error: error.message }, { status: 500 });
    }
}
