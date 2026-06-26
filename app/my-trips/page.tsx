useEffect(() => {
  const loadTrips = async () => {
    const { data, error } = await supabase
      .from('bookings')
      .select('*');

    console.log('Supabase data:', data);
    console.log('Supabase error:', error);

    if (!error) {
      setBookings(data || []);
    }
  };

  loadTrips();
}, []);
