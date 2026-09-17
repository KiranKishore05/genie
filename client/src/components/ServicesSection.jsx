import { useEffect, useState } from "react";
import { getServices } from "../utils/api";
import Services from "./Services";
import SkeletonService from "./SkeletonService";
import { SkeletonTheme } from "react-loading-skeleton";
import PortalLayout from "./PortalLayout";
import ServiceDetails from "./ServiceDetails";

export default function ServicesSection() {
    const [servicesData, setServicesData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedService, setSelectedService] = useState(null);

    const handleServiceClick = (serviceName) => {
        setSelectedService(serviceName);
    };

    useEffect(() => {
        const fetchServices = async () => {
            try {
                setIsLoading(true);
                const data = await getServices();
                const safeData = Array.isArray(data) ? data : [];
                const sortedData = [...safeData].sort(
                    (a, b) => (a.order ?? 0) - (b.order ?? 0)
                );
                setServicesData(sortedData);
            } catch (error) {
                console.error("Error fetching services:", error);
                setServicesData([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchServices();
    }, []);

    return (
        <>
            <div id="services">
                <h1 className="text-4xl py-4 font-[NeuwMachinaBold]">
                    OUR SERVICES
                </h1>
                <SkeletonTheme baseColor="#bfdbfe" highlightColor="#F5F5DC">
                    <div className="w-full grid grid-cols-1 min-[425px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 py-4 text-center text-sm border-t border-black">
                        {isLoading
                            ? Array(6)
                                  .fill()
                                  .map((_, index) => (
                                      <SkeletonService key={index} />
                                  ))
                            : servicesData.map((service, index) => (
                                  <Services
                                      key={
                                          service._id ||
                                          service.serviceName ||
                                          `service-${index}`
                                      }
                                      serviceImage={service.serviceImage}
                                      serviceName={service.serviceName}
                                      onServiceClick={handleServiceClick}
                                  />
                              ))}
                    </div>
                </SkeletonTheme>
            </div>
            <PortalLayout
                isOpen={!!selectedService}
                onClose={() => setSelectedService(null)}
            >
                {selectedService && (
                    <ServiceDetails serviceName={selectedService} />
                )}
            </PortalLayout>
        </>
    );
}
